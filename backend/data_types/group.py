from .waypoint import WayPoint

from typing import List
from pydantic import BaseModel


class Group(BaseModel):
    group_type: str = ""
    unit_type: str = ""
    name: str = ""
    country: str = ""
    coalition: str = ""
    lat: float = 0
    lon: float = 0
    client: bool = False
    range: int = 0
    waypoints: List[WayPoint] = []
