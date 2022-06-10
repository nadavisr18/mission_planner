from enum import Enum

import yaml

with open("backend/config.yml") as file:
    config = yaml.load(file, Loader=yaml.FullLoader)

PlanesEnum = Enum('PlanesEnum', config['BackendToDisplayName'], type=str)
