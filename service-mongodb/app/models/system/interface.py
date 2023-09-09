from datetime import datetime
from pydantic import BaseModel, Field, AliasChoices
from app.utils.db import PyObjectId


class SearchInterface(BaseModel):
    path: str | None = None
    group: str | None = None
    title: str | None = None
    method: str | None = None


class Interface(SearchInterface):
    uid: PyObjectId | None = Field(None, validation_alias=AliasChoices('_id',  'uid'))
    create_at: datetime | None = Field(default_factory=datetime.utcnow)  # 创建时间
    update_at: datetime | None = Field(default_factory=datetime.utcnow)  # 更新时间

    class Config:
        name = 'interface'
