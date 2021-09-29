from backend.mission_editing import MissionParser, RadiosEditor, KneeboardEditor, WeatherEditor
from backend.data_types import Mission, KneeboardPage, WeatherData, RadioPresets
from backend.utils import *

from typing import Union, List, Tuple
from fastapi import FastAPI, HTTPException
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
    """
    Save a new mission file input from the user, to manipulate later.\n
    input consists of:\n
        "data": {mission file bytes},\n
        "name": {mission name},\n
        "session id": {current user session id}\n
    """
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


@app.delete("/mission/{session_id}", responses={404: {"description": "Session Not Found"}})
def delete_mission(session_id: str):
    """
    Completely delete a mission file.
    """
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
            raise HTTPException(status_code=404, detail="Session not found")


@app.post("/waypoint/{session_id}", responses={404: {"description": "Session Not Found"}})
def add_waypoint(waypoints: Union[List[WayPoint], WayPoint], session_id: str):
    """
    Add one or more waypoints to a mission given it's Session ID.
    """
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
            raise HTTPException(status_code=404, detail="Session not found")


@app.delete("/waypoint/{session_id}/{waypoint_id}", responses={404: {"description": "Session Not Found | Waypoint Not Found"}})
def delete_waypoint(session_id: str, waypoint_id: str):
    """
    Add one or more waypoints to a mission given it's Session ID.
    """
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
                raise HTTPException(status_code=404, detail="No Such Waypoint")
            data[session_id].update({'waypoints': existing_waypoints})
            json.dump(data, file)
        else:
            json.dump(data, file)
            raise HTTPException(status_code=404, detail="Session not found")


@app.get("/process_mission/{session_id}", responses={404: {"description": "Session Not Found"}})
def process_mission(session_id: str):
    """
    Apply all the changes to the mission given it's Session ID.
    """
    path = f"backend\\temp_files\\missions\\{session_id}.miz"
    data = get_dictionary()
    if session_id in data.keys():
        edit_waypoints(data, session_id, path)
        with open(path, 'rb') as file:
            output = Mission(data=file.read(), name=data[session_id]['mission_name'], session_id=session_id)
            output.data = base64.encodebytes(output.data)
            return output.dict()
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.get("/mission_details/client_aircraft/{session_id}", responses={404: {"description": "Session Not Found"}})
def get_client_aircraft(session_id: str):
    """
    Get the names and types of all the groups that have client aircraft
    """
    path = f"backend\\temp_files\\missions\\{session_id}.miz"
    data = get_dictionary()
    if session_id in data.keys():
        mp = MissionParser(path)
        types, names = mp.get_client_aircraft()
        return [types, names]
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post("/radios/{session_id}", responses={404: {"description": "Session Not Found"}})
def set_radio_presets(presets: RadioPresets, session_id: str):
    """
    A route to set radio presets in the mission, per aircraft type.
    """
    data = get_dictionary()
    if session_id in data.keys():
        path = f"backend\\temp_files\\missions\\{session_id}.miz"
        re = RadiosEditor(path)
        re.set_radios(presets)
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post('/kneeboard/{session_id}', responses={404: {"description": "Session Not Found"}})
def add_kneeboard_page(page_data: KneeboardPage, session_id: str):
    """
    Add a kneeboard image to a mission given it's Session ID
    """
    data = get_dictionary()
    if session_id in data.keys():
        path = f"backend\\temp_files\\missions\\{session_id}.miz"
        ke = KneeboardEditor(path)
        ke.add_page(page_data.data, page_data.name, page_data.aircraft)
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.delete('/kneeboard/{session_id}', responses={404: {"description": "Session Not Found"}})
def delete_kneeboard_page(page_data: KneeboardPage, session_id: str):
    """
    delete a kneeboard page from a mission given the page data nd Session ID
    """
    data = get_dictionary()
    if session_id in data.keys():
        path = f"backend\\temp_files\\missions\\{session_id}.miz"
        ke = KneeboardEditor(path)
        ke.remove_page(page_data.name, page_data.aircraft)
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post('/weather/{session_id}')
def change_weather(weather_data: WeatherData):
    """
    change the weather in the mission, based on real time data.
    """
    data = get_dictionary()
    if weather_data.session_id in data.keys():
        path = f"backend\\temp_files\\missions\\{weather_data.session_id}.miz"
        we = WeatherEditor(path)
        while True:
            try:
                weather_data.city = get_random_city()[0] if weather_data.city.lower() == "random" else weather_data.city
                condition, wind_dir, wind_speed = we.change_weather(weather_data.city, weather_data.time)
                return {"condition": condition, "wind_dir": wind_dir, "wind_speed": wind_speed}
            except BaseException as e:
                pass
    else:
        raise HTTPException(status_code=404, detail="Session not found")


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, log_level="info")
