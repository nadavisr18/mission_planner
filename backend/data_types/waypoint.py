from dataclasses import dataclass
from pydantic import BaseModel
from folium import Marker
from enum import Enum


class AltTypeEnum(str, Enum):
    baro = 'BARO'
    radar = 'RADIO'


class WayPoint(BaseModel):
    lat: float = None
    lon: float = None
    altitude: float = None
    aircraft: str = None
    name: str = None
    alt_type: AltTypeEnum = None
    wp_id: str = None
