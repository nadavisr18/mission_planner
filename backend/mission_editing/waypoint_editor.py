from backend.data_types import WayPoint
from .edit_mission import MissionEditor

from typing import List, Tuple
import hashlib
import math


class WayPointEditor(MissionEditor):
    def __init__(self, path):
        super().__init__(path)
        self.key2wp = {}

    def _update_dictionary(self):
        for key in self.key2wp:
            self.dictionary.update({key: self.key2wp[key]})

    def edit_waypoints(self, waypoints: List[WayPoint]):
        for country in self.mission['coalition']['blue']['country']:
            country_dict = self.mission['coalition']['blue']['country'][country]
            if 'plane' not in country_dict.keys():
                continue
            for group in country_dict['plane']['group']:
                group_dict = country_dict['plane']['group'][group]
                for unit in group_dict['units']:
                    unit_dict = group_dict['units'][unit]
                    skill = unit_dict['skill']
                    if skill == 'Client':
                        group_dict = self._change_group_wp(group_dict, unit_dict['type'], waypoints)
                        country_dict['plane']['group'][group] = group_dict
                        break
            self.mission['coalition']['blue']['country'][country] = country_dict
        self._save_lua_data({'mission': self.mission, 'l10n/DEFAULT/dictionary': self.dictionary})

    def _change_group_wp(self, group_data: dict, unit_type: str, waypoints: List[WayPoint]) -> dict:
        unit_waypoints = self._get_unit_path(unit_type, waypoints)
        group_data['route']['points'] = {1: group_data['route']['points'][1]}
        for i, wp in enumerate(unit_waypoints):
            group_data = self._add_waypoint(group_data, wp, i)
        return group_data

    def _add_waypoint(self, group_data: dict, wp: WayPoint, i: int):
        point = self.point_template()
        x, y = self._convert_waypoint(wp.lat, wp.lon)
        point.update({'alt': wp.altitude / 0.3048})  # altitude in mission file is meters
        point.update({'alt_type': wp.alt_type})
        point.update({'x': x})
        point.update({'y': y})
        point.update({'name': wp.name})
        # waypoints start from 1 and we don't touch the first waypoint (spawn place), hence i + 2
        group_data['route']['points'].update({i + 2: point})
        return group_data

    def _convert_waypoint(self, lat: float, lon: float):

        lon_diff = lon - self.map_center['lon']
        lat_diff = lat - self.map_center['lat']
        y_diff, x_diff = self.ll2xy_model.predict([[lat_diff, lon_diff], ])[0] * 111139
        return y_diff, x_diff

    @staticmethod
    def _get_unit_path(unit_type: str, waypoints: List[WayPoint]) -> List[WayPoint]:
        output = []
        for wp in waypoints:
            if wp.aircraft == unit_type or wp.aircraft == "Everyone":
                output.append(wp)
        return output

    @staticmethod
    def point_template() -> dict:
        temp = {"alt": 0,
                "action": "Turning Point",
                "alt_type": "BARO",
                "speed": 350,
                "task": {"id": "ComboTask", "params": {"tasks": {}}},
                "type": "Turning Point",
                "ETA": 222.09261818747,
                "ETA_locked": False,
                "y": 630705.49543577,
                "x": -217613.56066099,
                "name": "DictKey_WptName_",
                "formation_template": "",
                "speed_locked": True}
        return temp
