from pydantic import BaseModel


class Group(BaseModel):
    group_type: str
    unit_type: str
    name: str
    country: str
    coalition: str
    lat: float
    lon: float
    range: int = 0
