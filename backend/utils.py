from backend.mission_editing import WayPointEditor
from backend.data_types import WayPoint

import numpy as np
import json


def get_dictionary():
    with open(f"backend\\temp_files\\dictionary.json", 'r') as file:
        data = json.load(file)
    return data


def edit_waypoints(data: dict, session_id: str, path: str):
    wpe = WayPointEditor(path)
    waypoints = []
    for waypoint in data[session_id]['waypoints']:
        waypoints.append(WayPoint.parse_obj(waypoint))
    wpe.edit_waypoints(waypoints)


def get_random_city():
    with open("backend/world-cities.csv", 'r', encoding='utf-8') as file:
        lines = file.readlines()
        random_index = np.random.randint(len(lines))
        line = lines[random_index]
        picked_city = line.split(',')[0]
        country = line.split(',')[1]
    return picked_city, country
