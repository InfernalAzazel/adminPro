from typing import List, Any, Dict
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


class StatusCode:
    ok: int = 200
    bad_request: int = 400
    unauthorized: int = 401
    forbidden: int = 403
    not_found: int = 404
    jwt_expired: int = 419
    jwt_decode_failed: int = 422
    username_password_error: int = 460
    user_disabled: int = 480
    get_roles_failed: int = 490
    internal_server_error: int = 500
    # --------------自定义-------------------
    interface_add_successfully = 1001
    interface_add_failed = 1002
    interface_delete_successfully = 1003
    interface_delete_failed = 1004
    interface_get_successfully = 1005
    interface_get_failed = 1006
    interface_modify_successfully = 1007
    interface_modify_failed = 1008

    menu_add_successfully = 1101
    menu_add_failed = 1102
    menu_delete_successfully = 1103
    menu_delete_failed = 1104
    menu_get_successfully = 1105
    menu_get_failed = 1106
    menu_modify_successfully = 1107
    menu_modify_failed = 1108

    role_add_successfully = 1201
    role_add_failed = 1202
    role_delete_successfully = 1203
    role_delete_failed = 1204
    role_get_successfully = 1205
    role_get_failed = 1206
    role_modify_successfully = 1207
    role_modify_failed = 1208

    user_add_successfully = 1301
    user_add_failed = 1302
    user_delete_successfully = 1303
    user_delete_failed = 1304
    user_get_successfully = 1305
    user_get_failed = 1306
    user_modify_successfully = 1307
    user_modify_failed = 1308

    messages = {
        ok: "操作成功",
        bad_request: "错误请求",
        unauthorized: "未授权",
        forbidden: "禁止访问",
        not_found: "未找到",
        jwt_expired: "JWT过期",
        jwt_decode_failed: "JWT解码失败",
        username_password_error: "用户名或密码错误",
        user_disabled: "用户被禁用",
        get_roles_failed: "获取角色失败",

        internal_server_error: "内部服务器错误",
        interface_add_successfully: "接口添加成功",
        interface_add_failed: "接口添加失败",
        interface_delete_successfully: "接口删除成功",
        interface_delete_failed: "接口删除失败",
        interface_get_successfully: "接口获取成功",
        interface_get_failed: "接口获取失败",
        interface_modify_successfully: "接口修改成功",
        interface_modify_failed: "接口修改失败",

        menu_add_successfully: "菜单添加成功",
        menu_add_failed: "菜单添加失败",
        menu_delete_successfully: "菜单删除成功",
        menu_delete_failed: "菜单删除失败",
        menu_get_successfully: "菜单获取成功",
        menu_get_failed: "菜单获取失败",
        menu_modify_successfully: "菜单修改成功",
        menu_modify_failed: "菜单修改失败",

        role_add_successfully: "角色添加成功",
        role_add_failed: "角色添加失败",
        role_delete_successfully: "角色删除成功",
        role_delete_failed: "角色删除失败",
        role_get_successfully: "角色获取成功",
        role_get_failed: "角色获取失败",
        role_modify_successfully: "角色修改成功",
        role_modify_failed: "角色修改失败",

        user_add_successfully: "用户添加成功",
        user_add_failed: "用户已经存在, 添加失败",
        user_delete_successfully: "用户删除成功",
        user_delete_failed: "用户删除失败",
        user_get_successfully: "用户获取成功",
        user_get_failed: "用户获取失败",
        user_modify_successfully: "用户修改成功",
        user_modify_failed: "用户修改失败",
    }

    def __init__(self, status_code: int = 200, detail: str | None = None):
        self.status_code = status_code
        self.detail = detail

    def __str__(self):
        return self.messages.get(self.status_code, "未知错误")


class ExceptionResponse(Exception):
    def __init__(
            self,
            status_code: int,
            detail: Any = None,
    ):
        self.status_code = status_code
        self.detail = StatusCode(status_code=status_code, detail=detail)


class ResponseMessages(JSONResponse):
    def __init__(self, status_code: int = 200, detail: str | None = None, data: List[Any] | Any | None = None,
                 field_value: Dict[str, Any] = None, **kwargs):
        content = {
            "status_code": status_code,
            "success": status_code == 200,
            "detail": detail,
            "data": data,
        }
        if field_value:
            content.update(field_value)
        super().__init__(content=jsonable_encoder(content), **kwargs)
