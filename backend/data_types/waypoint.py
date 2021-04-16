from dataclasses import dataclass
from pydantic import BaseModel
from folium import Marker
from enum import Enum


class AltTypeEnum(str, Enum):
    baro = 'BARO'
    radar = 'RADIO'


@dataclass
class BackEndInterfaceWayPoint:
    marker: Marker = None
    lat: float = None
    lon: float = None
    altitude: float = None
    aircraft: str = None
    color: str = None
    name: str = None
    viz: bool = None
    alt_type: str = None


class WayPoint(BaseModel):
    lat: float = None
    lon: float = None
    altitude: float = None
    aircraft: str = None
    name: str = None
    alt_type: AltTypeEnum = None
    wp_id: str = None
