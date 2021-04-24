from backend.mission_editing import MissionParser, RadiosEditor, KneeboardEditor
from backend.data_types import Mission, KneeboardPage
from backend.utils import *

from typing import Union, List
from fastapi import FastAPI
import uvicorn
import json
import os
import base64

from fastapi.middleware.cors import CORSMiddleware

origins = ["*"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def is_alive():
    return "I'm Alive!"


@app.post("/mission")
def new_mission(mission: Mission):
    # create mission file to later manipulate
    with open(f"backend\\temp_files\\missions\\{mission.session_id}.miz", 'wb') as file:
        file.write(base64.decodebytes(mission.data))
    # save metadata about the mission
    data = get_dictionary()
    with open(f"backend\\temp_files\\dictionary.json", 'w') as file:
        data.update({mission.session_id: {"mission_name": mission.name,
                                          "waypoints": []
                                          }})
        json.dump(data, file)


@app.delete("/mission/{session_id}")
def delete_mission(session_id: str):
    # delete the mission file
    os.remove(f"backend\\temp_files\\missions\\{session_id}.miz")
    # delete mission metadata
    data = get_dictionary()
    with open(f"backend\\temp_files\\dictionary.json", 'w') as file:
        if session_id in data.keys():
            data.pop(session_id)
            json.dump(data, file)
        else:
            json.dump(data, file)
            return "Session ID doesn't exist"


@app.post("/waypoint/{session_id}")
def add_waypoint(waypoints: Union[List[WayPoint], WayPoint], session_id: str):
    data = get_dictionary()
    waypoints = [waypoints] if type(waypoints) == WayPoint else waypoints
    with open(f"backend\\temp_files\\dictionary.json", 'w') as file:
        if session_id in data.keys():
            existing_waypoints = data[session_id]['waypoints']
            for waypoint in waypoints:
                if any([wp['wp_id'] == waypoint.wp_id for wp in existing_waypoints]):
                    json.dump(data, file)
                    return "Cannot add an existing waypoint"
                existing_waypoints.append(waypoint.dict())
                data[session_id].update({'waypoints': existing_waypoints})
            json.dump(data, file)
        else:
            json.dump(data, file)
            return "Session ID doesn't exist"


@app.delete("/waypoint/{session_id}/{waypoint_id}")
def delete_waypoint(session_id: str, waypoint_id: str):
    data = get_dictionary()
    with open(f"backend\\temp_files\\dictionary.json", 'w') as file:
        if session_id in data.keys():
            existing_waypoints = data[session_id]['waypoints']
            for i, wp in enumerate(existing_waypoints):
                if wp['wp_id'] == waypoint_id:
                    existing_waypoints.remove(wp)
                    break
            else:
                json.dump(data, file)
                return "No Such Waypoint"
            data[session_id].update({'waypoints': existing_waypoints})
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
            output.data = base64.encodebytes(output.data)
            return output.dict()
    else:
        return "Session ID doesn't exist"


@app.get("/mission_details/client_aircraft/{session_id}")
def get_client_aircraft(session_id: str):
    path = f"backend\\temp_files\\missions\\{session_id}.miz"
    data = get_dictionary()
    if session_id in data.keys():
        mp = MissionParser(path)
        types, names = mp.get_client_aircraft()
        return [types, names]
    else:
        return "Session ID doesn't exist"


@app.post("/radios/{session_id}")
def set_radio_presets(presets: dict, session_id: str):
    # presets is expected to look like
    # {
    #     "FA-18C": {
    #         "1": {
    #             "12": 260
    #         }
    #     }
    # }
    data = get_dictionary()
    if session_id in data.keys():
        path = f"backend\\temp_files\\missions\\{session_id}.miz"
        re = RadiosEditor(path)
        re.set_radios(presets)
    else:
        return "Session ID doesn't exist"


@app.post('/kneeboard/{session_id}')
def add_kneeboard_page(page_data: KneeboardPage, session_id: str):
    data = get_dictionary()
    if session_id in data.keys():
        path = f"backend\\temp_files\\missions\\{session_id}.miz"
        ke = KneeboardEditor(path)
        ke.add_page(page_data.data, page_data.aircraft)
    else:
        return "Session ID doesn't exist"


@app.delete('/kneeboard/{session_id}')
def delete_kneeboard_page(page_data: KneeboardPage, session_id: str):
    data = get_dictionary()
    if session_id in data.keys():
        path = f"backend\\temp_files\\missions\\{session_id}.miz"
        ke = KneeboardEditor(path)
        ke.remove_page(page_data.name, page_data.aircraft)
    else:
        return "Session ID doesn't exist"


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, log_level="info")
