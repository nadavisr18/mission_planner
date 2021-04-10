from dataclasses import dataclass
from folium import Marker


@dataclass
class WayPoint:
    marker: Marker = None
    lat: float = None
    lon: float = None
    altitude: float = None
    aircraft: str = None
    color: str = None
    name: str = None
    viz: bool = None
    alt_type: str = None
