from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from app.models.system.syslog import SysLog
from app.models.system.user import User
from app.utils.custom_response import ResponseMessages
from app.utils.db import async_db_engine
from app.utils.dependencies import auto_current_user_permission

router = APIRouter(
    prefix="/api",
    tags=["system -> syslog"],
)


@router.get('/v1/system/syslog/all')
async def all(
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    coll = db_engine[SysLog.Config.name]

    cursor = coll.find({})

    try:
        data = [SysLog(**v).model_dump() async for v in cursor]
    except Exception:
        data = []

    return ResponseMessages(data=data)


@router.get('/v1/system/syslog/list')
async def lists(
        uid: str = None,
        username: str = None,
        create_at: list[datetime] = Query(None),
        update_at: list[datetime] = Query(None),
        current_page: int = 1,  # 跳过
        page_size: int = 10,  # 跳过
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    skip = (current_page - 1) * page_size

    coll = db_engine[SysLog.Config.name]

    search_syslog = SysLog(username=username)
    query = search_syslog.model_dump(exclude_none=True)

    if id is not None and id != '':
        query['_id'] = ObjectId(uid)
    if update_at:
        query['update_at'] = {
            '$gte': update_at[0].astimezone(timezone.utc),
            '$lte': update_at[1].astimezone(timezone.utc)
        }
    if create_at:
        query['create_at'] = {
            '$gte': create_at[0].astimezone(timezone.utc),
            '$lte': create_at[1].astimezone(timezone.utc)
        }

    cursor = coll.find(query).skip(skip).limit(page_size)
    count = await coll.count_documents(search_syslog.model_dump(exclude_none=True))
    try:
        data = [SysLog(**v).model_dump() async for v in cursor]
    except Exception:
        data = []

    return ResponseMessages(data=data, field_value={'total': count})


@router.post('/v1/system/syslog/add')
async def add(
        syslog: SysLog,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    coll = db_engine[SysLog.Config.name]
    result = await coll.insert_one(syslog.model_dump(exclude_none=True))
    if not result.inserted_id:
        return ResponseMessages(status_code=1)
    return ResponseMessages()


@router.put('/v1/system/syslog/edit')
async def edit(
        syslog: SysLog,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    coll = db_engine[SysLog.Config.name]
    syslog.update_at = datetime.now(tz=timezone.utc)
    await coll.find_one_and_update(
        {'_id': ObjectId(syslog.uid)},
        {'$set': syslog.model_dump(exclude={'uid', 'create_at'})},
    )

    return ResponseMessages()


@router.delete('/v1/system/syslog/delete')
async def delete(
        uid: str,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission)
):
    coll = db_engine[SysLog.Config.name]
    await coll.delete_one({'_id': ObjectId(uid)})

    return ResponseMessages()
