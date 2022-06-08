from backend.mission_editing import WayPointEditor
from backend.data_types import WayPoint

from typing import List
import numpy as np
import json
import os


def get_dictionary():
    if not os.path.isfile("backend\\temp_files\\dictionary.json"):
        with open("backend\\temp_files\\dictionary.json", 'w') as file:
            file.write("{}")

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


def generate_random_waypoints(num: int, waypoint: WayPoint) -> List[WayPoint]:
    import uuid
    waypoints = []
    for i in range(num):
        wp = waypoint.copy()
        wp.lon = 29.5+np.random.rand()*(42.3333-29.5)
        wp.lat = 31.9+np.random.rand()*(37.75-31.9)
        wp.wp_id = uuid.uuid4().hex
        waypoints.append(wp)
    return waypoints
