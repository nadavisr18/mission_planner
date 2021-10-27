from pydantic import BaseModel
from typing import List
from enum import Enum
from .aircraft_types import PlanesEnum


class RadioOptions(int, Enum):
    one = 1
    two = 2


class ChannelsPresets(BaseModel):
    radio: RadioOptions
    preset: int
    frequency: float


class RadioPresets(BaseModel):
    aircraft: PlanesEnum
    channels_presets: List[ChannelsPresets]
