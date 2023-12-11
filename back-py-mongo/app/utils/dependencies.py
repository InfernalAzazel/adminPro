import casbin
from bson import ObjectId
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError
from jose.exceptions import JWTClaimsError, JWTError
from app.models.system.interface import InterfaceResponseModel
from app.models.system.role import RoleResponseModel
from app.models.system.user import UserResponseModel
from app.utils.custom_adapter import Adapter
from app.utils.custom_response import ExceptionResponse, StatusCode
from app.utils.db import async_db_engine
from app.utils.jwt import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_language(request: Request):
    language = request.headers.get("Customize-Language", "en_us")
    return language


# 获取当前用户
async def get_current_user(
        language: str = Depends(get_language),
        token: str = Depends(oauth2_scheme),
):
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise ExceptionResponse(locale=language, status_code=StatusCode.jwt_decode_failed)
    except ExpiredSignatureError as _:
        raise ExceptionResponse(locale=language, status_code=StatusCode.jwt_expired)
    except JWTClaimsError as _:
        raise ExceptionResponse(locale=language, status_code=StatusCode.jwt_decode_failed)
    except JWTError as _:
        raise ExceptionResponse(locale=language, status_code=StatusCode.jwt_decode_failed)
    db_client = async_db_engine()
    doc = await db_client[UserResponseModel.Config.name].find_one({'username': username})

    if doc is None:
        raise ExceptionResponse(locale=language, status_code=StatusCode.username_password_error)

    user_model = UserResponseModel(**doc)

    return user_model


# 自动用户认证权限
async def auto_current_user_permission(
        request: Request,
        language: str = Depends(get_language),
        current_user: UserResponseModel = Depends(get_current_user)):

    path = request.url.path
    method = request.method

    if current_user.disabled:
        raise ExceptionResponse(locale=language, status_code=StatusCode.user_disabled)

    db_client = async_db_engine()
    coll = db_client[RoleResponseModel.Config.name]
    role_doc = await coll.find_one({'name': current_user.role_name})

    # 获取角色失败
    if not role_doc:
        raise ExceptionResponse(locale=language, status_code=StatusCode.get_roles_failed)
    role_model = RoleResponseModel(**role_doc)
    # 获取接口
    coll = db_client[InterfaceResponseModel.Config.name]
    obj_uids = [ObjectId(uid) for uid in role_model.interface_permission]
    cursor = coll.find({'_id': {'$in': obj_uids}})
    interface_models = [InterfaceResponseModel(**x) async for x in cursor]

    # 设置适配器
    adapter = Adapter(role_model, interface_models)
    e = casbin.Enforcer('rbac_model.conf', adapter)
    # # 验证接口权限
    if e.enforce(role_model.uid, path, method):
        pass
    else:
        raise ExceptionResponse(locale=language, status_code=StatusCode.unauthorized)
    return current_user
