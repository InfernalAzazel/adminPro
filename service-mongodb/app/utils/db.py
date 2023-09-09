from typing import Annotated
from zoneinfo import ZoneInfo

import motor.motor_asyncio
from pydantic import PlainValidator

from app.settings import MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOST, TZ_INFO, DATABASE_NAME

PyObjectId = Annotated[str, PlainValidator(lambda v: str(v))]


def async_db_engine():
    return motor.motor_asyncio.AsyncIOMotorClient(
        f'mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_HOST}',
        tz_aware=True,
        tzinfo=ZoneInfo(TZ_INFO)
    )[DATABASE_NAME]
