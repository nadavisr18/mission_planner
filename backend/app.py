from .mission_editing.edit_mission import MissionEditor
from backend.data_types import Mission, WayPoint

from fastapi import FastAPI
import json
import os

app = FastAPI()


@app.get("/")
def is_alive():
    return "I'm Alive!"


@app.post("/mission")
def new_mission(mission: Mission):
    # create mission file to later manipulate
    with open(f"backend\\temp_files\\missions\\{mission.session_id}.miz", 'wb') as file:
        file.write(mission.data)
    # save metadata about the mission
    with open(f"backend\\temp_files\\dictionary.json", 'w+') as file:
        data = json.load(file)
        data.update({mission.session_id: {"mission_name": mission.name,
                                          "waypoints": []
                                          }})
        json.dump(data, file)


@app.delete("/mission/{session_id}")
def delete_mission(session_id: str):
    # delete the mission file
    os.remove(f"backend\\temp_files\\{session_id}")
    # delete mission metadata
    with open(f"backend\\temp_files\\dictionary.json", 'w+') as file:
        data = json.load(file)
        if session_id in data.keys():
            data.pop(session_id)
            json.dump(data, file)
        else:
            return "ID doesn't exist"


@app.post("/waypoint/{session_id}")
def add_waypoint(waypoint: WayPoint, session_id: str):
    # add waypoint to mission metadata
    with open(f"backend\\temp_files\\dictionary.json", 'w+') as file:
        data = json.load(file)
        if session_id in data.keys():
            existing_waypoints = data['session_id']['waypoints']
            data['session_id'].update({'waypoints': existing_waypoints.append(waypoint)})
            json.dump(data, file)
        else:
            return "ID doesn't exist"
