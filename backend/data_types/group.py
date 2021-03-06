from typing import List

from pydantic import BaseModel

from .waypoint import WayPoint


class Group(BaseModel):
    group_type: str
    unit_type: str
    name: str
    country: str
    coalition: str
    lat: float
    lon: float
    client: bool = False
    range: int = 0
    waypoints: List[WayPoint] = []
