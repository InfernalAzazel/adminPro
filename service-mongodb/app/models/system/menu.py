from datetime import datetime
from typing import Any, List
from pydantic import BaseModel, Field, AliasChoices
from app.utils.db import PyObjectId


class SearchMenu(BaseModel):
    key: int | None = None
    father: int | None = None
    path: str | None = None
    title: str | None = None
    icon: str | None = None
    component: str | None = None
    order: int | None = None


class Menu(SearchMenu):
    uid: PyObjectId | None = Field(None, validation_alias=AliasChoices('_id',  'uid'))
    create_at: datetime | None = Field(default_factory=datetime.utcnow)  # 创建时间
    update_at: datetime | None = Field(default_factory=datetime.utcnow)  # 更新时间

    class Config:
        name = 'menu'


class MenuModel(Menu):
    children: list[Menu] = None


class ALLMenuModel(BaseModel):
    status_code: int
    success: bool
    detail: str = None
    data: List[MenuModel] | Any | None = None


class ListMenuModel(ALLMenuModel):
    total: int = 0
