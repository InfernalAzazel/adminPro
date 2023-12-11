from datetime import datetime, timezone
import bson
import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends
from app.models.base import ResponseTotalModel, ResponseModel, query_params_exclude
from app.models.system.interface import InterfaceAddOREditModel, InterfaceResponseModel, QueryParamsModel
from app.models.system.role import RoleResponseModel
from app.models.system.user import UserResponseModel
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.db import async_db_engine
from app.utils.dependencies import auto_current_user_permission, get_language

router = APIRouter(
    prefix="/api",
    tags=["system -> interface"],
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)


@router.get('/v1/system/interface/all')
async def all_data(
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    coll = db_engine[InterfaceResponseModel.Config.name]

    query = {}

    cursor = coll.find(query)
    data = [InterfaceResponseModel(**x).model_dump() async for x in cursor]
    return ResponseMessages(locale=language, data=data)


@router.get(
    '/v1/system/interface/list',
    responses={
        200: {"model": ResponseTotalModel},
        422: {"model": ResponseModel}
    }
)
async def list_data(
        qp_model: QueryParamsModel = Depends(),
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    skip = (qp_model.current_page - 1) * qp_model.page_size
    coll = db_engine[InterfaceResponseModel.Config.name]

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
    data = [InterfaceResponseModel(**x).model_dump() async for x in cursor]
    return ResponseMessages(locale=language, data=data, total=count)


@router.post('/v1/system/interface/add')
async def add(
        interface_add_model: InterfaceAddOREditModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    coll = db_engine[interface_add_model.Config.name]
    data = interface_add_model.model_dump()
    data['create_at'] = datetime.now(timezone.utc)

    result = await coll.insert_one(data)
    if not result.inserted_id:
        return ResponseMessages(locale=language, status_code=StatusCode.interface_add_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.interface_add_successfully, success=True)


@router.put('/v1/system/interface/edit')
async def edit(
        uid: str,
        interface_edit_model: InterfaceAddOREditModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    try:
        obj_uid = ObjectId(uid)
    except bson.errors.InvalidId:
        return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    coll = db_engine[interface_edit_model.Config.name]
    data = interface_edit_model.model_dump()
    data['update_at'] = datetime.now(timezone.utc)
    result = await coll.update_one(
        {'_id': obj_uid},
        {'$set': data},
    )
    if result.modified_count == 0:
        return ResponseMessages(locale=language, status_code=StatusCode.interface_modify_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.interface_modify_successfully, success=True)


@router.delete('/v1/system/interface/delete')
async def delete(
        uid: str,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission)
):
    try:
        obj_uid = ObjectId(uid)
    except bson.errors.InvalidId:
        return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    coll = db_engine[RoleResponseModel.Config.name]
    await coll.update_many(
        {},
        {'$pull': {
            'interface_permission': uid
        }})
    coll = db_engine[InterfaceAddOREditModel.Config.name]
    result = await coll.delete_one({'_id': obj_uid})
    if result.deleted_count == 0:
        return ResponseMessages(locale=language, status_code=StatusCode.interface_delete_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.interface_delete_successfully, success=True)
