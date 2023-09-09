from datetime import datetime
from typing import TYPE_CHECKING, Any
from pydantic import BaseModel, Field, AliasChoices

from app.utils.db import PyObjectId


class SysLog(BaseModel):
    uid: PyObjectId | None = Field(None, validation_alias=AliasChoices('_id',  'uid'))
    username: str | None = None
    host: str | None = None
    browser: str | None = None
    os: str | None = None
    path: str | None = None
    query_params: str | None = None
    method: str | None = None
    text: str | None = None
    create_at: datetime | None = Field(default_factory=datetime.utcnow)  # 创建时间
    update_at: datetime | None = Field(default_factory=datetime.utcnow)  # 更新时间

    class Config:
        name = 'syslog'
