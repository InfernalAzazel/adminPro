from datetime import datetime, timezone
from typing import List

import bson
import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends, Query

from app.models.base import query_params_exclude, ResponseModel, ResponseTotalModel
from app.models.system.menu import QueryParamsModel, MenuAddOREditModel, MenuResponseModel
from app.models.system.role import RoleResponseModel
from app.models.system.user import UserResponseModel
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.dependencies import async_db_engine, auto_current_user_permission, get_language

router = APIRouter(
    prefix="/api",
    tags=["system -> menu"],
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)


# 有 参数
@router.get('/v1/system/menu/all')
async def all_data(
        uids: List[str] = Query(None),
        is_query: bool = Query(False),
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    query = {}
    if not uids and is_query:
        return ResponseMessages(locale=language, data=[])
    if uids:
        try:
            obj_uids = [ObjectId(uid) for uid in uids]
            query = {'_id': {'$in': obj_uids}}
        except bson.errors.InvalidId:
            return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    coll = db_engine[MenuResponseModel.Config.name]
    cursor = coll.find(query)
    data = [MenuResponseModel(**x).model_dump() async for x in cursor]
    return ResponseMessages(locale=language, data=data)


@router.get(
    '/v1/system/menu/list',
    responses={
        200: {"model": ResponseTotalModel},
        422: {"model": ResponseModel}
    }
)
async def list_data(
        qp_model: QueryParamsModel = Depends(),
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission)
):
    skip = (qp_model.current_page - 1) * qp_model.page_size
    coll = db_engine[MenuResponseModel.Config.name]

    query = qp_model.model_dump(exclude_none=True, exclude=query_params_exclude)

    if qp_model.uid:
        try:
            obj_uid = ObjectId(qp_model.uid)
        except bson.errors.InvalidId:
            return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)
        query['_id'] = obj_uid
    if qp_model.start_update_at and qp_model.end_update_at:
        query['update_at'] = {
            '$gte': qp_model.start_update_at.astimezone(timezone.utc),
            '$lte': qp_model.end_update_at.astimezone(timezone.utc)
        }
    if qp_model.start_create_at and qp_model.end_create_at:
        query['create_at'] = {
            '$gte': qp_model.start_create_at.astimezone(timezone.utc),
            '$lte': qp_model.end_create_at.astimezone(timezone.utc)
        }

    cursor = coll.find(query).skip(skip).limit(qp_model.page_size).sort([
        ('group', pymongo.ASCENDING),
    ])
    count = await coll.count_documents(query)
    data = [MenuResponseModel(**x).model_dump() async for x in cursor]
    return ResponseMessages(locale=language, data=data, total=count)


@router.post('/v1/system/menu/add')
async def add(
        menu_add_model: MenuAddOREditModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    coll = db_engine[MenuAddOREditModel.Config.name]
    data = menu_add_model.model_dump()
    data['create_at'] = datetime.now(timezone.utc)
    count = await coll.count_documents({'key': menu_add_model.key})
    if count > 0:
        return ResponseMessages(locale=language, status_code=StatusCode.menu_add_failed)

    result = await coll.insert_one(data)
    if not result.inserted_id:
        return ResponseMessages(locale=language, status_code=StatusCode.menu_add_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.menu_add_successfully, success=True)


@router.put('/v1/system/menu/edit')
async def edit(
        uid: str,
        menu_edit_model: MenuAddOREditModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    try:
        obj_uid = ObjectId(uid)
    except bson.errors.InvalidId:
        return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    coll = db_engine[MenuAddOREditModel.Config.name]
    # 前端会自带 children 字段，所以这里不需要更新
    data = menu_edit_model.model_dump(exclude={'children'})
    data['update_at'] = datetime.utcnow()
    result = await coll.update_one(
        {'_id': obj_uid},
        {'$set': data},
    )
    if result.modified_count == 0:
        return ResponseMessages(locale=language, status_code=StatusCode.menu_modify_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.menu_modify_successfully, success=True)


@router.delete('/v1/system/menu/delete')
async def delete(
        uid: str,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    try:
        obj_uid = ObjectId(uid)
    except bson.errors.InvalidId:
        return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    coll = db_engine[MenuResponseModel.Config.name]
    result = await coll.delete_one({'_id': obj_uid})
    if result.deleted_count == 0:
        return ResponseMessages(locale=language, status_code=StatusCode.menu_delete_failed)

    coll = db_engine[RoleResponseModel.Config.name]
    await coll.update_many(
        {},
        {'$pull': {
            'menu_permission': uid
        }})
    return ResponseMessages(locale=language, status_code=StatusCode.menu_delete_successfully, success=True)
