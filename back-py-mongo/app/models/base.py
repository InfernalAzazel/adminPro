from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, AliasChoices
from app.utils.db import PyObjectId


class ResponseModel(BaseModel):
    status_code: int = Field()
    success: bool = Field()
    detail: str = Field()
    data: list[Any] | Any = Field()


class ResponseTotalModel(ResponseModel):
    total: int = Field()


class ResponseLoginModel(ResponseModel):
    access_token: str = Field()
    token_type: str = Field()


class AttachQueryParamsModel(BaseModel):
    start_create_at: datetime | None = Field(None, alias='startCreateTime')
    end_create_at: datetime | None = Field(None, alias='endCreateTime')
    start_update_at: datetime | None = Field(None, alias='startUpdateTime')
    end_update_at: datetime | None = Field(None, alias='endUpdateTime')
    current_page: int = Field(1, alias='current')
    page_size: int = Field(10, alias='pageSize')


class AttachResponseModel(BaseModel):
    uid: PyObjectId | None = Field(None, validation_alias=AliasChoices('_id', 'uid'))
    create_at: datetime | None = Field(None)  # 创建时间
    update_at: datetime | None = Field(None)  # 更新时间


# 查询参数排除字段
query_params_exclude = {
    'uid',
    'start_create_at',
    'end_create_at',
    'start_update_at',
    'end_update_at',
    'current_page',
    'page_size'
}
