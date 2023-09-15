from datetime import datetime, timezone
from typing import List

import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends, Query

from app.models.system.menu import Menu, SearchMenu, ALLMenuModel, ListMenuModel
from app.models.system.role import Role
from app.models.system.user import User
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.db import PyObjectId
from app.utils.dependencies import async_db_engine, auto_current_user_permission

router = APIRouter(
    prefix="/api",
    tags=["system -> menu"],
)


@router.get('/v1/system/menu/all', response_model=ALLMenuModel)
async def all(
        uids: List[str] = Query(None),
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Menu.Config.name]

    query = {}

    if uids:
        obj_ids = [ObjectId(uid) for uid in uids]
        query = {'_id': {'$in': obj_ids}}

    cursor = coll.find(query).sort([
        ('order', pymongo.ASCENDING),
    ])

    try:
        data = [Menu(**x).model_dump() async for x in cursor]
    except Exception as _:
        data = []

    return ResponseMessages(data=data)


@router.get('/v1/system/menu/list', response_model=ListMenuModel)
async def lists(
        uid: str = None,
        key: int = None,
        father: int = None,
        path: str = None,
        title: str = None,
        icon: str = None,
        component: str = None,
        order: int = None,
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

    coll = db_engine[Menu.Config.name]
    search_menu = SearchMenu(
        key=key,
        father=father,
        path=path,
        title=title,
        icon=icon,
        component=component,
        order=order
    )

    query = search_menu.model_dump(exclude_none=True)

    if uid:
        query['_id'] = ObjectId(uid)
    if start_update_at and end_update_at:
        query['update_at'] = {'$gte': start_update_at.astimezone(timezone.utc),
                              '$lte': end_update_at.astimezone(timezone.utc)}
    if start_create_at and end_create_at:
        query['create_at'] = {'$gte': start_create_at.astimezone(timezone.utc),
                              '$lte': end_create_at.astimezone(timezone.utc)}

    cursor = coll.find(query).skip(skip).limit(page_size).sort([
        ('order', pymongo.ASCENDING),
    ])

    try:
        data = [Menu(**x).model_dump() async for x in cursor]
        # data = list_to_tree(jsonable_encoder(menu_list), 0)
    except Exception as _:
        data = []
    return ResponseMessages(data=data)


@router.post('/v1/system/menu/add')
async def add(
        menu: Menu,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Menu.Config.name]
    doc = await coll.find_one({'key': menu.key})
    if doc:
        return ResponseMessages(status_code=StatusCode.menu_add_failed)
    await coll.insert_one(menu.model_dump())
    return ResponseMessages(status_code=StatusCode.menu_add_successfully)


@router.put('/v1/system/menu/edit')
async def edit(
        menu: Menu,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Menu.Config.name]

    result = await coll.update_one(
        {'_id': ObjectId(menu.uid)},
        # 前端会自带 id create_at children 字段，所以这里不需要更新
        {'$set': menu.model_dump(exclude={'uid', 'create_at', 'children'})},
    )
    if result.modified_count == 0:
        return ResponseMessages(status_code=StatusCode.menu_modify_failed)

    return ResponseMessages(status_code=StatusCode.menu_modify_successfully)


@router.delete('/v1/system/menu/delete')
async def delete(
        uid: str,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Menu.Config.name]
    result = await coll.delete_one({'_id': ObjectId(uid)})
    if result.deleted_count == 0:
        return ResponseMessages(status_code=StatusCode.menu_delete_failed)

    coll = db_engine[Role.Config.name]
    await coll.update_many(
        {},
        {'$pull': {
            'menu_permission': {'uid': uid}
        }})
    return ResponseMessages(status_code=StatusCode.menu_delete_successfully)
