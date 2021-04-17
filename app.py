from backend.mission_editing import MissionParser
from backend.data_types import Mission
from backend.utils import *

from typing import List
from fastapi import FastAPI
import uvicorn
import json
import os

DICTIONARY_PATH = "backend/temp_files/dictionary.json"
app = FastAPI()


@app.get("/")
def is_alive():
    return "I'm Alive!"


@app.post("/mission")
def new_mission(mission: Mission):
    # create mission file to later manipulate
    with open(f"temp_files\\missions\\{mission.session_id}.miz", 'wb') as file:
        file.write(mission.data)
    # save metadata about the mission
    data = get_dictionary()
    with open(DICTIONARY_PATH, 'w') as file:
        data.update({mission.session_id: {"mission_name": mission.name,
                                          "waypoints": []
                                          }})
        json.dump(data, file)


@app.delete("/mission/{session_id}")
def delete_mission(session_id: str):
    # delete the mission file
    os.remove(f"temp_files\\missions\\{session_id}.miz")
    # delete mission metadata
    data = get_dictionary()
    with open(DICTIONARY_PATH, 'w') as file:
        if session_id in data.keys():
            data.pop(session_id)
            json.dump(data, file)
        else:
            json.dump(data, file)
            return "Session ID doesn't exist"


@app.post("/waypoints/{session_id}")
def add_waypoints(waypoints: List[WayPoint], session_id: str):
    data = get_dictionary()
    with open(DICTIONARY_PATH, 'w') as file:
        if session_id in data.keys():
            dict_waypoints = [wp.dict() for wp in waypoints]
            data[session_id].update({'waypoints': dict_waypoints})
            json.dump(data, file)
        else:
            json.dump(data, file)
            return "Session ID doesn't exist"


@app.get("/process_mission/{session_id}")
def process_mission(session_id: str):
    path = f"backend\\temp_files\\missions\\{session_id}.miz"
    data = get_dictionary()
    if session_id in data.keys():
        edit_waypoints(data, session_id, path)
        with open(path, 'rb') as file:
            output = Mission(data=file.read(), name=data[session_id]['mission_name'], session_id=session_id)
            return output.dict()
    else:
        return "Session ID doesn't exist"


@app.get("/mission_details/aircraft_types/{session_id}")
def get_aircraft_types(session_id: str):
    path = f"backend\\temp_files\\missions\\{session_id}.miz"
    data = get_dictionary()
    if session_id in data.keys():
        mp = MissionParser(path)
        types = mp.get_client_aircraft_types()
        return types
    else:
        return "Session ID doesn't exist"


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, log_level="info")
