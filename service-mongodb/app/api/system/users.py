from datetime import datetime
from datetime import timezone

import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder

from app.models.system.menu import Menu
from app.models.system.role import Role
from app.models.system.user import User, SearchUser
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.db import async_db_engine
from app.utils.dependencies import auto_current_user_permission
from app.utils.menu_node_tree import list_to_tree

router = APIRouter(
    prefix="/api",
    tags=["system -> users"],
)


@router.get('/v1/system/users/account')
async def account(
        current_user: User = Depends(auto_current_user_permission),
):
    return ResponseMessages(data=current_user)


@router.get('/v1/system/users/routes')
async def routers(
        current_user: User = Depends(auto_current_user_permission),
        db_engine=Depends(async_db_engine)
):
    coll = db_engine[Role.Config.name]
    doc = await coll.find_one({'name': current_user.role_name})
    if not doc:
        ResponseMessages(status_code=StatusCode.role_get_failed)

    role = Role(**doc)
    coll = db_engine[Menu.Config.name]

    obj_ids = [ObjectId(uid) for uid in role.menu_permission]
    query = {'_id': {'$in': obj_ids}}

    cursor = coll.find(query).sort([
        ('order', pymongo.ASCENDING),
    ])

    try:
        data = [Menu(**x).model_dump() async for x in cursor]
    except Exception as _:
        print(_)
        data = []

    # 拼接菜单路由
    menu_permission = list_to_tree(jsonable_encoder(data), 0, is_add_redirect=True)
    return ResponseMessages(data=data)


@router.get('/v1/system/users/list')
async def lists(
        uid: str = None,
        username: str = None,
        name: str = None,
        mail: str = None,
        company: str = None,
        department: str = None,
        disabled: bool = None,
        role_name: str = None,
        start_create_at: datetime | None = Query(None, alias='startCreateTime'),
        end_create_at: datetime | None = Query(None, alias='endCreateTime'),
        start_update_at: datetime = Query(None, alias='startUpdateTime'),
        end_update_at: datetime = Query(None, alias='endUpdateTime'),
        current_page: int = Query(1, alias='current'),
        page_size: int = Query(10, alias='pageSize'),
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)

):
    skip = (current_page - 1) * page_size

    coll = db_engine[User.Config.name]

    search_user = SearchUser(
        username=username,
        name=name,
        mail=mail,
        company=company,
        department=department,
        disabled=disabled,
        role_name=role_name
    )

    query = search_user.model_dump(exclude_none=True)

    if uid:
        query['_id'] = ObjectId(uid)
    if start_update_at and end_update_at:
        query['update_at'] = {'$gte': start_update_at.astimezone(timezone.utc),
                              '$lte': end_update_at.astimezone(timezone.utc)}
    if start_create_at and end_create_at:
        query['create_at'] = {'$gte': start_create_at.astimezone(timezone.utc),
                              '$lte': end_create_at.astimezone(timezone.utc)}

    cursor = coll.find(query).skip(skip).limit(page_size)
    count = await coll.count_documents(query)
    try:
        data = [User(**x).model_dump() async for x in cursor]
    except Exception as _:
        data = []
    return ResponseMessages(data=data, field_value={'total': count})


@router.post('/v1/system/users/add')
async def add(
        user: User,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    coll = db_engine[User.Config.name]
    doc = await coll.find_one({'username': user.username})
    if doc:
        return ResponseMessages(status_code=StatusCode.user_add_failed)
    result = await coll.insert_one(user.model_dump())
    if not result.inserted_id:
        return ResponseMessages(status_code=1)
    return ResponseMessages(status_code=StatusCode.user_add_successfully)


@router.put('/v1/system/users/edit')
async def edit(
        user: User,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[User.Config.name]
    result = await coll.find_one_and_update(
        {'_id': ObjectId(user.uid)},
        {'$set': user.model_dump(exclude={'uid', 'create_at'})},
    )
    if not result:
        return ResponseMessages(status_code=StatusCode.user_modify_failed)
    return ResponseMessages(status_code=StatusCode.user_modify_successfully)


@router.delete('/v1/system/users/delete')
async def delete(
        uid: str,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[User.Config.name]
    await coll.delete_one({'_id': ObjectId(uid)})

    return ResponseMessages()
