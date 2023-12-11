from pydantic import BaseModel, Field
from app.models.base import AttachQueryParamsModel, AttachResponseModel


class UserEditModel(BaseModel):
    username: str | None = None  # 帐号： quid1111
    disabled: bool | None = None  # 禁用：True == 禁用
    role_name: str | None = None  # 关联角色
    name: str | None = None  # 姓名:  张三
    mail: str | None = None  # 邮箱
    company: str | None = None  # 公司
    department: str | None = None  # 部门

    class Config:
        name = 'users'


class QueryParamsModel(UserEditModel, AttachQueryParamsModel):
    uid: str | None = Field(None)


class UserAddModel(UserEditModel):
    password: str = None  # 密码： 123456


class UserResponseModel(UserEditModel, AttachResponseModel):
    pass
