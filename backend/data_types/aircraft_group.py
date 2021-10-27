from pydantic import BaseModel


class AircraftGroup(BaseModel):
    coalition: str
    country: str
    aircraft: str
    size: int