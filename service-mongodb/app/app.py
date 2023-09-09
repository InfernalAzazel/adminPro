from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.system import users, menu, role, interface, syslog
from app.routers import auth
from app.utils.custom_response import ExceptionResponse, ResponseMessages


app = FastAPI(
    title="ServiceMongodb",
    description="ServiceMongodb API",
    version="stable 0.0.1",
)


@app.exception_handler(ExceptionResponse)
async def http_exception_handler(request: Request, exc: ExceptionResponse):
    """覆盖HTTP异常处理程序，以返回自定义响应 """
    return ResponseMessages(exc.status_code, detail=str(exc.detail))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """覆盖请求验证异常处理程序，以返回自定义响应 """
    # return JSONResponse(
    #     status_code=200,
    #     content=ResponseMessages(StatusCode.bad_request, message=str(exc)),
    # )
    return JSONResponse(content='{"code": 400, "message": "请求参数错误"}')


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(menu.router)
app.include_router(role.router)
app.include_router(interface.router)
app.include_router(syslog.router)


app.mount('/', StaticFiles(directory='app/static/public', html=True), name='static')


@app.on_event('startup')
async def startup():
    pass
