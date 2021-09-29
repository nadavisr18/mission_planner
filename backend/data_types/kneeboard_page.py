from pydantic import BaseModel
from .aircraft_types import PlanesEnum


class KneeboardPage(BaseModel):
    data: bytes
    aircraft: PlanesEnum
    name: str
