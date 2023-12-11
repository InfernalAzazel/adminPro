from pydantic import BaseModel, Field
from app.models.base import AttachResponseModel, AttachQueryParamsModel


class MenuAddOREditModel(BaseModel):
    key: int | None = Field(None)
    father: int | None = Field(None)
    path: str | None = Field(None)
    name: str | None = Field(None)
    icon: str | None = Field(None)
    order: int | None = Field(None)
    locale: str | None = Field(None)

    class Config:
        name = 'menu'


class QueryParamsModel(MenuAddOREditModel, AttachQueryParamsModel):
    uid: str | None = Field(None)


class MenuResponseModel(MenuAddOREditModel, AttachResponseModel):
    pass
