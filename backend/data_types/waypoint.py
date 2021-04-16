from folium import Marker
from pydantic import BaseModel


class WayPoint(BaseModel):
    marker: Marker = None
    lat: float = None
    lon: float = None
    altitude: float = None
    aircraft: str = None
    color: str = None
    name: str = None
    viz: bool = None
    alt_type: str = None
    wp_id: str = None
