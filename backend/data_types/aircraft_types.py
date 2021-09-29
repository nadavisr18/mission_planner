from enum import Enum
import yaml

with open("backend/interface/config.yml") as file:
    config = yaml.load(file, Loader=yaml.FullLoader)

PlanesEnum = Enum('PlanesEnum', config['DisplayToBackendName'])