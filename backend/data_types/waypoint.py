from enum import Enum

from pydantic import BaseModel


class AltTypeEnum(str, Enum):
    baro = 'BARO'
    radar = 'RADIO'


class WayPoint(BaseModel):
    lat: float
    lon: float
    altitude: float
    group: str
    name: str = None
    alt_type: AltTypeEnum
    wp_id: str
