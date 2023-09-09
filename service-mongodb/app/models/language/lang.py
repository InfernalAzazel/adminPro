from datetime import datetime
from typing import Dict

from pydantic import BaseModel, AliasChoices, Field

from app.utils.db import PyObjectId


class Lang(BaseModel):
    uid: PyObjectId | None = Field(None, validation_alias=AliasChoices('_id', 'uid'))
    name: str | None = None
    translations: Dict[str, str] | None = None
    create_at: datetime | None = Field(default_factory=datetime.utcnow)  # 创建时间
    update_at: datetime | None = Field(default_factory=datetime.utcnow)  # 更新时间

    class Config:
        name = 'lang'
