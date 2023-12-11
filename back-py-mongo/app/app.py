from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.system import users, menu, role, interface
from app.routers import auth, init
from app.utils.custom_response import ExceptionResponse, ResponseMessages, StatusCode

app = FastAPI(
    title="adminPro",
    description="adminPro API",
    version="stable 0.0.1",
)


@app.exception_handler(ExceptionResponse)
async def http_exception_handler(request: Request, exc: ExceptionResponse):
    """如何异常 """
    return ResponseMessages(locale=exc.locale, status_code=exc.status_code, success=False, detail=str(exc.detail))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """422 客户端输入数据验证异常"""
    return JSONResponse(
        status_code=200,
        content=ResponseMessages(locale=exc.locale, status_code=StatusCode.bad_request, success=False, detail=str(exc)),
    )

app.include_router(init.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(menu.router)
app.include_router(role.router)
app.include_router(interface.router)

app.mount('/', StaticFiles(directory='app/static/dist', html=True), name='static')


@app.on_event('startup')
async def startup():
    pass
