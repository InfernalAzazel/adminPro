from datetime import datetime
from datetime import timezone
import bson
import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends
from app.models.base import query_params_exclude, ResponseModel, ResponseTotalModel
from app.models.system.menu import MenuResponseModel
from app.models.system.role import RoleResponseModel
from app.models.system.user import QueryParamsModel, UserResponseModel, UserAddModel, UserEditModel
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.db import async_db_engine
from app.utils.dependencies import auto_current_user_permission, get_language

router = APIRouter(
    prefix="/api",
    tags=["system -> users"],
)


@router.get(
    '/v1/system/users/account',
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)
async def account(
        language: str = Depends(get_language),
        current_user: UserResponseModel = Depends(auto_current_user_permission),
):
    return ResponseMessages(locale=language, data=current_user)


@router.get(
    '/v1/system/users/routes',
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)
async def routers(
        language: str = Depends(get_language),
        current_user: UserResponseModel = Depends(auto_current_user_permission),
        db_engine=Depends(async_db_engine)
):
    # 角色
    coll = db_engine[RoleResponseModel.Config.name]
    cursor = coll.find({'name': {'$in': current_user.role_name}})
    menu_permission = []
    # 添加多个角色菜单权限
    async for x in cursor:
        role_model = RoleResponseModel(**x)
        menu_permission.extend(role_model.menu_permission)

    if not menu_permission:
        ResponseMessages(locale=language, status_code=StatusCode.role_get_failed)
    # 去重
    menu_permission = list(set(menu_permission))

    try:
        obj_uids = [ObjectId(uid) for uid in menu_permission]
    except bson.errors.InvalidId:
        return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    query = {'_id': {'$in': obj_uids}}
    # 菜单
    coll = db_engine[MenuResponseModel.Config.name]
    cursor = coll.find(query)
    data = [MenuResponseModel(**x).model_dump() async for x in cursor]
    # 没有分配菜单权限非法登录
    if not data:
        return ResponseMessages(locale=language, status_code=StatusCode.illegal_login)
    return ResponseMessages(locale=language, data=data)


@router.get(
    '/v1/system/users/list',
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
    coll = db_engine[UserResponseModel.Config.name]

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
    data = [UserResponseModel(**x).model_dump() async for x in cursor]
    return ResponseMessages(locale=language, data=data, total=count)


@router.post(
    '/v1/system/users/add',
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)
async def add(
        user_add_model: UserAddModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission)
):
    coll = db_engine[UserResponseModel.Config.name]
    doc = await coll.find_one({'username': user_add_model.username})

    if doc:
        return ResponseMessages(locale=language, status_code=StatusCode.user_add_failed)

    data = user_add_model.model_dump()
    data['create_at'] = datetime.now(timezone.utc)
    result = await coll.insert_one(data)

    if not result.inserted_id:
        return ResponseMessages(locale=language, status_code=StatusCode.user_add_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.user_add_successfully, success=True)


@router.put(
    '/v1/system/users/edit',
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)
async def edit(
        uid: str,
        user_edit_model: UserEditModel,
        language: str = Depends(get_language),
        db_engine=Depends(async_db_engine),
        _: UserResponseModel = Depends(auto_current_user_permission),
):
    try:
        obj_uid = ObjectId(uid)
    except bson.errors.InvalidId:
        return ResponseMessages(locale=language, status_code=StatusCode.not_valid_object_id)

    coll = db_engine[UserResponseModel.Config.name]
    data = user_edit_model.model_dump()
    data['update_at'] = datetime.utcnow()

    result = await coll.update_one(
        {'_id': obj_uid},
        {'$set': data},
    )
    if result.modified_count == 0:
        return ResponseMessages(locale=language, status_code=StatusCode.user_modify_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.user_modify_successfully, success=True)


@router.delete(
    '/v1/system/users/delete',
    responses={
        200: {"model": ResponseModel},
        422: {"model": ResponseModel}
    }
)
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

    coll = db_engine[UserResponseModel.Config.name]
    result = await coll.delete_one({'_id': obj_uid})
    if result.deleted_count == 0:
        return ResponseMessages(locale=language, status_code=StatusCode.user_delete_failed)
    return ResponseMessages(locale=language, status_code=StatusCode.user_delete_successfully, success=True)
