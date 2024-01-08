from typing import List
from pydantic import BaseModel, Field
from app.models.base import AttachResponseModel, AttachQueryParamsModel


class RoleAddOREditModel(BaseModel):
    name: str | None = Field(None)
    describe: str | None = Field(None)
    menu_permission: List[str] | None = Field(None)
    interface_permission: List[str] | None = Field(None)

    class Config:
        name = 'role'


class QueryParamsModel(AttachQueryParamsModel, BaseModel):
    uid: str | None = Field(None)
    name: str | None = Field(None)


class RoleResponseModel(RoleAddOREditModel, AttachResponseModel):
    pass
