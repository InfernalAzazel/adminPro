from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from app.models.system.role import SearchRole, Role
from app.models.system.user import User
from app.utils.custom_response import ResponseMessages, StatusCode
from app.utils.db import async_db_engine
from app.utils.dependencies import auto_current_user_permission

router = APIRouter(
    prefix="/api",
    tags=["system -> role"],
)


@router.get('/v1/system/role/all')
async def all(
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Role.Config.name]
    cursor = coll.find({})
    try:
        data = [Role(**v).model_dump() async for v in cursor]
    except Exception:
        data = []
    return ResponseMessages(data=data)


@router.get('/v1/system/role/list')
async def lists(
        uid: str = None,
        name: str = None,
        create_at: list[datetime] = Query(None),
        update_at: list[datetime] = Query(None),
        current_page: int = 1,  # 跳过
        page_size: int = 10,  # 跳过
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    skip = (current_page - 1) * page_size

    coll = db_engine[Role.Config.name]

    search_role = SearchRole(name=name)
    query = search_role.model_dump(exclude_none=True)

    if uid:
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
    count = await coll.count_documents(query)
    try:
        data = [Role(**v).model_dump() async for v in cursor]
    except Exception:
        data = []

    return ResponseMessages(data=data, field_value={'total': count})


@router.post('/v1/system/role/add')
async def add(
        role: Role,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Role.Config.name]
    count = await coll.count_documents({'_id': ObjectId(role.uid)})
    if count == 1:
        return ResponseMessages(status_code=StatusCode.role_add_failed)
    await coll.insert_one(role.model_dump())
    return ResponseMessages(status_code=StatusCode.role_add_successfully)


@router.put('/v1/system/role/edit')
async def edit(
        role: Role,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Role.Config.name]
    doc = await coll.find_one({'_id': ObjectId(role.uid)})
    print(role.model_dump())
    if(not doc):
        return ResponseMessages(status_code=StatusCode.role_modify_failed)
    role.update_at = datetime.utcnow()
    await coll.find_one_and_update(
        {'_id': ObjectId(role.uid)},
        {'$set': role.model_dump(exclude={'uid', 'create_at'})},
    )
    # 更新用户的角色名称
    coll = db_engine[User.Config.name]
    await coll.update_many(
        {'role_name': doc['name']},
        {'$set': {'role_name': role.name}},
    )

    return ResponseMessages(status_code=StatusCode.role_modify_successfully)


@router.delete('/v1/system/role/delete')
async def delete(
        name: str,
        db_engine=Depends(async_db_engine),
        _: User = Depends(auto_current_user_permission),
):
    coll = db_engine[Role.Config.name]
    await coll.delete_one({'name': name})
    # 用户的角色名称加入提示 并且 禁用用户使用不存在的该角色
    # 注: 角色被删除 用来标识被删除的角色
    coll = db_engine[User.Config.name]

    data = {
        **{'role_name': '角色被删除'},
        **{'disabled': True}
    }

    await coll.update_many(
        {'role_name': name},
        {'$set': data},
    )

    return ResponseMessages(status_code=StatusCode.role_delete_successfully)
