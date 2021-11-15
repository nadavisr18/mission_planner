from pydantic import BaseModel


class Unit(BaseModel):
    lat: float
    lon: float
    angle: float
    category: str
