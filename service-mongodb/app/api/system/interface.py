from datetime import datetime, timezone

import pymongo
from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from fastapi.encoders import jsonable_encoder

from app.models.system.interface import SearchInterface, Interface
from app.models.system.role import Role
from app.models.system.user import User
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.db import async_db_engine
from app.utils.dependencies import auto_current_user_permission

router = APIRouter(
    prefix="/api",
    tags=["system -> interface"],
)


@router.get('/v1/system/interface/all')
async def all(
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Interface.Config.name]

    query = {}

    cursor = coll.find(query).sort([
        ('group', pymongo.ASCENDING),
    ])
    try:
        data = [Interface(**x).model_dump() async for x in cursor]
    except Exception as _:
        data = []
    return ResponseMessages(data=jsonable_encoder(data))


@router.get('/v1/system/interface/list')
async def lists(
        uid: str = None,
        path: str = None,
        group: str = None,
        title: str = None,
        method: str = None,
        start_create_at: datetime | None = Query(None, alias='startCreateTime'),
        end_create_at: datetime | None = Query(None, alias='endCreateTime'),
        start_update_at: datetime = Query(None, alias='startUpdateTime'),
        end_update_at: datetime = Query(None, alias='endUpdateTime'),
        current_page: int = Query(1, alias='current'),
        page_size: int = Query(10, alias='pageSize'),
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    skip = (current_page - 1) * page_size
    coll = db_engine[Interface.Config.name]

    search_interface = SearchInterface(
        path=path,
        group=group,
        title=title,
        method=method,
    )

    query = search_interface.model_dump(exclude_none=True)

    if uid:
        query['_id'] = ObjectId(uid)
    if start_update_at and end_update_at:
        query['update_at'] = {'$gte': start_update_at.astimezone(timezone.utc),
                              '$lte': end_update_at.astimezone(timezone.utc)}
    if start_create_at and end_create_at:
        query['create_at'] = {'$gte': start_create_at.astimezone(timezone.utc),
                              '$lte': end_create_at.astimezone(timezone.utc)}

    cursor = coll.find(query).skip(skip).limit(page_size).sort([
        ('group', pymongo.ASCENDING),
    ])
    count = await coll.count_documents(query)
    try:
        data = [Interface(**x).model_dump() async for x in cursor]
    except Exception as _:
        data = []

    return ResponseMessages(data=jsonable_encoder(data), field_value={'total': count})


@router.post('/v1/system/interface/add')
async def add(
        interface: Interface,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Interface.Config.name]
    interface.create_at = datetime.now(timezone.utc)
    result = await coll.insert_one(interface.model_dump())
    if result.inserted_id:
        return ResponseMessages(StatusCode.interface_add_successfully)
    return ResponseMessages(StatusCode.interface_add_failed)


@router.put('/v1/system/interface/edit')
async def edit(
        interface: Interface,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Interface.Config.name]
    interface.update_at = datetime.now(timezone.utc)
    count = await coll.count_documents({'_id': ObjectId(interface.uid)})

    if count == 1:
        await coll.update_one(
            {'_id': ObjectId(interface.uid)},
            {'$set': interface.model_dump(exclude={'uid', 'create_at'})},
        )
        return ResponseMessages(StatusCode.interface_modify_successfully)
    return ResponseMessages(StatusCode.interface_modify_failed)


@router.delete('/v1/system/interface/delete')
async def delete(
        uid: str,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    coll = db_engine[Role.Config.name]
    await coll.update_many(
        {},
        {'$pull': {
            'interface_permission': {'uid': uid}
        }})
    coll = db_engine[Interface.Config.name]
    result = await coll.delete_one({'_id': ObjectId(uid)})
    if result.deleted_count == 1:
        return ResponseMessages(StatusCode.interface_delete_successfully)
    return ResponseMessages(StatusCode.interface_delete_failed)
