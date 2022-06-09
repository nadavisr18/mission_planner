from datetime import datetime

import numpy as np
import requests
import yaml

from backend.data_types import WeatherOutput
from .edit_mission import MissionEditor


class WeatherEditor(MissionEditor):
    def __init__(self, path):
        super().__init__(path)
        with open('backend/mission_editing/weather_config.yml', 'r') as file:
            self.config = yaml.load(file, Loader=yaml.FullLoader)
        self.url = "http://api.weatherapi.com/v1/current.json?key=3961acc65a634b5697e173748201811&q={}"
        self.default_fog_height = 300

    def change_weather(self, city, time) -> WeatherOutput:
        temp, wind_speed, wind_dir, condition, clouds_height, pressure, visibility, gust, icon = self.get_weather(city)
        self.change_time(time)
        self.change_temp(temp)
        self.change_wind(wind_speed, wind_dir)
        self.change_clouds_based_on_status(condition, clouds_height, visibility)
        self.change_pressure(pressure)
        self.change_fog(self.default_fog_height, visibility)

        return WeatherOutput(**{"condition": condition, "wind_dir": wind_dir,
                                "wind_speed": wind_speed, "city": city, "icon": icon})

    def get_weather(self, city):
        response = requests.get(url=self.url.format(city))
        if response.status_code == 200:
            data = response.json()
            temp = data['current']['temp_c']
            wind_speed = data['current']['wind_kph'] / 1.852
            wind_dir = data['current']['wind_degree']+180
            condition = data['current']['condition']['text']
            icon = data['current']['condition']['icon']
            clouds_height = data['current']['cloud'] * 32.8084
            pressure = data['current']['pressure_mb'] / 1.3333
            visibility = data['current']['vis_km'] * 3280.84
            gust = data["current"]['gust_mph'] / 4
            return temp, wind_speed, wind_dir, condition, clouds_height, pressure, visibility, gust, icon
        else:
            raise BaseException("Location Not Found")

    def change_time(self, time: str):
        self.mission["start_time"] = int(time[:2]) * 3600 + int(time[2:]) * 60
        self.mission["date"]["Year"] = datetime.now().year
        self.mission["date"]["Month"] = datetime.now().month
        self.mission["date"]["Day"] = datetime.now().day

    def change_temp(self, temp: float):
        self.mission["weather"]["season"]["temperature"] = temp

    def change_pressure(self, pressure: float):
        self.mission["weather"]["qnh"] = pressure

    def change_wind(self, speed: float, direction: float):
        self.mission["weather"]["wind"]["at8000"]["speed"] = speed * np.random.normal(1.2, 0.1)
        self.mission["weather"]["wind"]["at8000"]["dir"] = (direction * np.random.normal(1, 0.1) + 180) % 360

        self.mission["weather"]["wind"]["at2000"]["speed"] = speed * np.random.normal(1.1, 0.1)
        self.mission["weather"]["wind"]["at2000"]["dir"] = (direction * np.random.normal(1, 0.1) + 180) % 360

        self.mission["weather"]["wind"]["atGround"]["speed"] = speed * np.random.normal(1, 0.1)
        self.mission["weather"]["wind"]["atGround"]["dir"] = (direction * np.random.normal(1, 0.1) + 180) % 360

    def change_clouds(self, base: float, preset: str):
        if 'preset' in self.mission["weather"]["clouds"].keys():
            self.mission["weather"]["clouds"]["preset"] = preset
        self.mission["weather"]["clouds"]["base"] = base

    def change_fog(self, height: float, visibility: float):
        self.mission["weather"]["fog"]["base"] = height
        self.mission["weather"]["fog"]["visibility"] = visibility
        self.mission["weather"]["enable_fog"] = True

    def change_clouds_based_on_status(self, cloud_condition, base, visibility):
        if cloud_condition in self.config['conditions']['clear']:
            preset = np.random.choice(self.config['presets']['clear'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['partly_cloudy']:
            preset = np.random.choice(self.config['presets']['partly_cloudy'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['cloudy']:
            preset = np.random.choice(self.config['presets']['cloudy'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['overcast']:
            preset = np.random.choice(self.config['presets']['overcast'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['patchy_rain']:
            preset = np.random.choice(self.config['presets']['patchy_rain'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['patchy_rain_thunder']:
            preset = np.random.choice(self.config['presets']['patchy_rain_thunder'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['light_shower']:
            preset = np.random.choice(self.config['presets']['light_shower'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['moderate_shower']:
            preset = np.random.choice(self.config['presets']['moderate_shower'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['conditions']['fog']:
            self.change_fog(height=1500, visibility=visibility)

    def get_mission_weather(self) -> WeatherOutput:
        hours = int(self.mission["start_time"])//3600
        minutes = (int(self.mission["start_time"])-hours*3600)//60
        minutes = minutes if len(str(minutes)) == 2 else str(minutes)+"0"
        time = "0"+f"{hours}{minutes}" if hours < 10 else f"{hours}{minutes}"

        cloud_preset = self.mission["weather"]["clouds"]["preset"]
        cloud_condition = "clear"
        icon = self.config['icons']['clear']
        for condition in self.config['presets']:
            if cloud_preset in self.config['presets'][condition]:
                cloud_condition = condition
                icon = self.config['icons'][cloud_condition]
        icon = self.daytime_icon(time, icon)

        wind_speed = self.mission["weather"]["wind"]["atGround"]["speed"]
        wind_dir = self.mission["weather"]["wind"]["atGround"]["dir"]

        return WeatherOutput(condition=cloud_condition, wind_dir=wind_dir, wind_speed=wind_speed, city="", icon=icon)

    @staticmethod
    def daytime_icon(time: str, icon: str) -> str:
        night_status = int(time[:2]) > 18 or int(time[:2]) < 6
        current_status = "night" if night_status else "day"
        other_status = "day" if night_status else "night"
        icon = icon.replace(other_status, current_status)
        return icon
