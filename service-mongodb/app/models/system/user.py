from datetime import datetime
from pydantic import BaseModel, Field, AliasChoices
from app.utils.db import PyObjectId


class SearchUser(BaseModel):
    username: str | None = None  # 帐号： quid1111
    disabled: bool | None = None  # 禁用：True == 禁用
    role_name: str | None = None # 关联角色
    name: str | None = None  # 姓名:  张三
    mail: str | None = None  # 邮箱
    company: str | None = None  # 公司
    department: str | None = None  # 部门


class User(SearchUser):
    uid: PyObjectId | None = Field(None, validation_alias=AliasChoices('_id',  'uid'))
    create_at: datetime | None = Field(default_factory=datetime.utcnow)  # 创建时间
    update_at: datetime | None = Field(default_factory=datetime.utcnow)  # 更新时间

    class Config:
        name = 'users'


class CreateUser(User):
    password: str = None  # 密码： 123456
