from .edit_mission import MissionEditor

from datetime import datetime
from typing import Tuple
import numpy as np
import requests
import yaml


class WeatherEditor(MissionEditor):
    def __init__(self, path):
        super().__init__(path)
        with open('weather\\weather_config.yml', 'r') as file:
            self.config = yaml.load(file, Loader=yaml.FullLoader)
        self.url = "http://api.weatherapi.com/v1/current.json?key=3961acc65a634b5697e173748201811&q={}"
        self.default_fog_height = 300

    def change_weather(self, city, time) -> Tuple[str, str, str]:
        temp, wind_speed, wind_dir, condition, clouds_height, pressure, visibility, gust = self.get_weather(city)
        self.change_time(time)
        self.change_temp(temp)
        self.change_wind(wind_speed, wind_dir)
        self.change_clouds_based_on_status(condition, clouds_height, visibility)
        self.change_pressure(pressure)
        self.change_fog(self.default_fog_height, visibility)

        return condition, wind_dir, wind_speed

    def get_weather(self, city):
        response = requests.get(url=self.url.format(city))
        if response.status_code == 200:
            data = response.json()
            temp = data['current']['temp_c']
            wind_speed = data['current']['wind_kph'] / 1.852
            wind_dir = data['current']['wind_degree']
            condition = data['current']['condition']['text']
            clouds_height = data['current']['cloud'] * 32.8084
            pressure = data['current']['pressure_mb'] / 1.3333
            visibility = data['current']['vis_km'] * 3280.84
            gust = data["current"]['gust_mph'] / 4
            return temp, wind_speed, wind_dir, condition, clouds_height, pressure, visibility, gust
        else:
            raise BaseException("Location Not Found")

    def change_time(self, time: str):
        self.mission["start_time"] = int(time[:2])*3600+int(time[2:])*60
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
        if cloud_condition in self.config['clear']:
            preset = np.random.choice(self.config['presets']['clear'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['partly_cloudy']:
            preset = np.random.choice(self.config['presets']['partly_cloudy'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['cloudy']:
            preset = np.random.choice(self.config['presets']['cloudy'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['overcast']:
            preset = np.random.choice(self.config['presets']['overcast'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['patchy_rain']:
            preset = np.random.choice(self.config['presets']['patchy_rain'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['patchy_rain_thunder']:
            preset = np.random.choice(self.config['presets']['patchy_rain_thunder'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['light_shower']:
            preset = np.random.choice(self.config['presets']['light_shower'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['moderate_shower']:
            preset = np.random.choice(self.config['presets']['moderate_shower'])
            self.change_clouds(base=base, preset=preset)

        elif cloud_condition in self.config['fog']:
            self.change_fog(height=1500, visibility=visibility)
