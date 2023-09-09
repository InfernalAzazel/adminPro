import casbin
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer

from app.models.system.role import Role
from app.models.system.user import User
from app.utils.custom_adapter import Adapter
from app.utils.custom_response import ExceptionResponse, StatusCode
from app.utils.db import async_db_engine
from app.utils.jwt import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


# 获取当前用户
async def get_current_user(
        token: str = Depends(oauth2_scheme),
):
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise ExceptionResponse(status_code=StatusCode.jwt_decode_failed)
    except Exception:
        raise ExceptionResponse(status_code=StatusCode.jwt_expired)

    db_client = async_db_engine()
    doc = await db_client[User.Config.name].find_one({'username': username})

    if doc is None:
        raise ExceptionResponse(status_code=StatusCode.username_password_error)

    user = User(**doc)

    return user


# 自动用户认证权限
async def auto_current_user_permission(request: Request, current_user: User = Depends(get_current_user)):
    path = request.url.path
    method = request.method
    host = request.client.host
    os = str(request.headers.get('sec-ch-ua-platform'))
    browser = request.headers.get('user-agent')
    query_params = str(dict(request.query_params.items()))
    try:
        body = (await request.body()).decode('utf-8')
    except RuntimeError:
        body = '上传文件'

    if current_user.disabled:
        raise ExceptionResponse(status_code=StatusCode.user_disabled)

    db_client = async_db_engine()
    # 只对 创建 修改 删除做记录
    # if method != 'GET':
    #     # 插入系统日志
    #     coll = db_client[DATABASE_NAME][COLL_SYSLOG]
    #     await coll.insert_one(syslog)

    coll = db_client[Role.Config.name]
    doc = await coll.find_one({'name': current_user.role_name})

    # 获取角色失败
    if not doc:
        raise ExceptionResponse(status_code=StatusCode.get_roles_failed)
    role = Role(**doc)

    # 设置适配器
    adapter = Adapter(doc)
    e = casbin.Enforcer('rbac_model.conf', adapter)
    # # 验证接口权限
    if e.enforce(role.uid, path, method):
        pass
    else:
        raise ExceptionResponse(status_code=StatusCode.unauthorized)
    return current_user
