from backend.mission_editing import WayPointEditor
from backend.data_types import WayPoint

import json


def get_dictionary():
    with open(f"temp_files\\dictionary.json", 'r') as file:
        data = json.load(file)
    return data


def edit_waypoints(data: dict, session_id: str, path: str):
    wpe = WayPointEditor(path)
    waypoints = []
    for waypoint in data[session_id]['waypoints']:
        waypoints.append(WayPoint.parse_obj(waypoint))
    wpe.edit_waypoints(waypoints)