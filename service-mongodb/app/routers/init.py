from fastapi import APIRouter, status, Depends
from starlette.responses import JSONResponse

from app.models.system.interface import Interface
from app.models.system.menu import Menu
from app.models.system.role import Role
from app.models.system.user import User
from app.utils.dependencies import async_db_engine
from app.utils.env_init import EnvInit

router = APIRouter(
    prefix="/api",
    tags=["init"],
)


@router.get('/v1/auth/init')
async def state(db_engine=Depends(async_db_engine)):
    """
    初始化配置
    """
    names = [User.Config.name, Role.Config.name, Menu.Config.name, Interface.Config.name]

    init = False
    for name in names:
        coll = db_engine[name]
        count = await coll.count_documents({})
        init = True if count == 0 else False
    if init:
        ei = EnvInit()
        await ei.import_mongodb()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={'code': 200},
    )
