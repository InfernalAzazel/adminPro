from datetime import timedelta

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from starlette.responses import JSONResponse

from app.models.system.user import User
from app.settings import JWT_MINUTES
from app.utils.custom_response import ExceptionResponse, StatusCode
from app.utils.db import async_db_engine
from app.utils.jwt import create_access_token

router = APIRouter(
    prefix="/api",
    tags=["auth"],
)


@router.post('/v1/auth/login')
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db_engine=Depends(async_db_engine)):
    """
    登录接口
    """

    # 数据库校验
    doc = await db_engine[User.Config.name].find_one(
        {'$and': [{'username': form_data.username}, {'password': form_data.password}]})

    if not doc:
        raise ExceptionResponse(status_code=StatusCode.username_password_error)

    user = User(**doc)

    # 生成访问令牌
    access_token_expires = timedelta(minutes=JWT_MINUTES)
    access_token = create_access_token(
        data={'sub': user.username},
        expires_delta=access_token_expires
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"access_token": access_token, "token_type": "bearer"}
    )
