from datetime import datetime
from typing import List, Dict
from pydantic import BaseModel, Field, AliasChoices
from app.utils.db import PyObjectId


class SearchRole(BaseModel):
    name: str | None = None


class Role(SearchRole):
    uid: PyObjectId | None = Field(None, validation_alias=AliasChoices('_id',  'uid'))
    describe: str | None = None
    menu_permission: List[Dict] | None = []
    interface_permission: List[Dict] | None = []
    create_at: datetime | None = Field(default_factory=datetime.utcnow)  # 创建时间
    update_at: datetime | None = Field(default_factory=datetime.utcnow)  # 更新时间

    class Config:
        name = 'role'
