from datetime import datetime, timezone
import bson
import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends
from app.models.base import query_params_exclude, ResponseModel, ResponseTotalModel
from app.models.system.role import QueryParamsModel, RoleResponseModel, RoleAddOREditModel
from app.models.system.user import UserResponseModel
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.db import async_db_engine
from app.utils.dependencies import auto_current_user_permission, get_language

router = APIRouter(
    prefix="/api",
    tags=["system -> role"],
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)


@router.get('/v1/system/role/all')
async def all_data(
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    coll = db_engine[RoleResponseModel.Config.name]
    cursor = coll.find({})
    data = [RoleResponseModel(**v).model_dump() async for v in cursor]
    return ResponseMessages(locale=language, data=data)


@router.get(
    '/v1/system/role/list',
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
    coll = db_engine[RoleResponseModel.Config.name]

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
    data = [RoleResponseModel(**x).model_dump() async for x in cursor]
    return ResponseMessages(locale=language, data=data, total=count)


@router.post('/v1/system/role/add')
async def add(
        role_add_model: RoleAddOREditModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    coll = db_engine[role_add_model.Config.name]
    count = await coll.count_documents({'name': role_add_model.name})
    data = role_add_model.model_dump()
    data['create_at'] = datetime.now(timezone.utc)
    if count > 0:
        return ResponseMessages(locale=language, status_code=StatusCode.role_add_failed)

    result = await coll.insert_one(data)
    if not result.inserted_id:
        return ResponseMessages(locale=language, status_code=StatusCode.role_add_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.role_add_successfully, success=True)


@router.put('/v1/system/role/edit')
async def edit(
        uid: str,
        role_edit_model: RoleAddOREditModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    try:
        obj_uid = ObjectId(uid)
    except bson.errors.InvalidId:
        return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    coll = db_engine[role_edit_model.Config.name]
    data = role_edit_model.model_dump()
    data['update_at'] = datetime.utcnow()
    # 修改角色并且返回修改前的文档
    result = await coll.find_one_and_update(
        {'_id': obj_uid},
        {'$set': data},
    )
    if result is None or not result:
        return ResponseMessages(locale=language, status_code=StatusCode.role_modify_failed)
    old_role_model = RoleResponseModel(**result)
    print('old_role_model', old_role_model.model_dump())
    # 更新用户的角色名称 #
    coll = db_engine[UserResponseModel.Config.name]
    await coll.update_many(
        {'role_name': old_role_model.name},
        {'$set': {'role_name': role_edit_model.name}},
    )

    return ResponseMessages(locale=language, status_code=StatusCode.role_modify_successfully, success=True)


@router.delete('/v1/system/role/delete')
async def delete(
        name: str,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):

    coll = db_engine[RoleResponseModel.Config.name]
    result = await coll.delete_one({'name': name})
    if result.deleted_count == 0:
        return ResponseMessages(locale=language, status_code=StatusCode.menu_delete_failed)

    # 用户的角色名称加入提示 并且 禁用用户使用不存在的该角色
    # 注: 角色被删除 用来标识被删除的角色
    coll = db_engine[UserResponseModel.Config.name]
    data = {
        'role_name': '角色被删除',
        'disabled': True
    }

    await coll.update_many(
        {'role_name': name},
        {'$set': data},
    )

    return ResponseMessages(locale=language, status_code=StatusCode.role_delete_successfully, success=True)
