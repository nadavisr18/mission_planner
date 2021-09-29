from typing import List
from pydantic import BaseModel
from enum import Enum
import yaml


with open("backend/interface/config.yml") as file:
    config = yaml.load(file, Loader=yaml.FullLoader)

PlanesEnum = Enum('PlanesEnum', config['DisplayToBackendName'])


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
