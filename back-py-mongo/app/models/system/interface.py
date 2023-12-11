from pydantic import BaseModel, Field
from app.models.base import AttachResponseModel, AttachQueryParamsModel


class InterfaceAddOREditModel(BaseModel):
    name: str | None = Field(None)
    path: str | None = Field(None)
    group: str | None = Field(None)
    method: str | None = Field(None)

    class Config:
        name = 'interface'


class QueryParamsModel(InterfaceAddOREditModel, AttachQueryParamsModel):
    uid: str | None = Field(None)


class InterfaceResponseModel(InterfaceAddOREditModel, AttachResponseModel):
    pass
