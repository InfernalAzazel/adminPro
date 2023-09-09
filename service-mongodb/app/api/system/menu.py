from datetime import datetime, timezone

import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder

from app.models.system.menu import Menu, SearchMenu, ALLMenuModel, ListMenuModel
from app.models.system.role import Role
from app.models.system.user import User
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.dependencies import async_db_engine, auto_current_user_permission
from app.utils.menu_node_tree import list_to_tree

router = APIRouter(
    prefix="/api",
    tags=["system -> menu"],
)


@router.get('/v1/system/menu/all', response_model=ALLMenuModel)
async def all(
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Menu.Config.name]

    query = {}

    cursor = coll.find(query).sort([
        ('order', pymongo.ASCENDING),
    ])

    try:
        menu_list = [Menu(**x).model_dump() async for x in cursor]
        data = list_to_tree(jsonable_encoder(menu_list), 0)
    except Exception as _:
        print(_)
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
        create_at: list[datetime] = Query(None),
        update_at: list[datetime] = Query(None),
        current: int = 1,  # 跳过
        pageSize: int = 10,  # 跳过
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    skip = (current - 1) * pageSize

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
    if update_at:
        query['update_at'] = {'$gte': update_at[0].astimezone(timezone.utc),
                              '$lte': update_at[1].astimezone(timezone.utc)}
    if create_at:
        query['create_at'] = {'$gte': create_at[0].astimezone(timezone.utc),
                              '$lte': create_at[1].astimezone(timezone.utc)}

    cursor = coll.find(query).skip(skip).limit(pageSize).sort([
        ('order', pymongo.ASCENDING),
    ])
    count = await coll.count_documents(query)

    try:
        menu_list = [Menu(**x).model_dump() async for x in cursor]
        data = list_to_tree(jsonable_encoder(menu_list), 0)
    except Exception as _:
        data = []
    return ResponseMessages(data=data, field_value={'total': count})


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
