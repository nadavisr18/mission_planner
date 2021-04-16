from backend.waypoint import WayPoint
from typing import List, Tuple
from slpp import slpp as lua
import hashlib
import zipfile
import math


class MissionEditor:
    def __init__(self, path: str):
        self.path = path
        self.mission, self.buffer_list = self._get_data('mission')
        self.dictionary, _ = self._get_data('l10n/DEFAULT/dictionary')
        self.key2wp = {}
        self.map_center = {"y": 96596.571428573, 'x': 29807.0, 'lat': 35.021298, 'lon': 35.899957}

    def _get_data(self, local_path: str) -> Tuple[dict, List[Tuple[bytes, str]]]:
        with zipfile.ZipFile(self.path, mode='r') as archive:
            with archive.open(local_path) as msnfile:
                raw_mission = msnfile.read().decode('utf-8')
                mission_dict = raw_mission.split(local_path.split("/")[-1] + " =")[1]
                mission = lua.decode(mission_dict)
                buffer_list = []
                for item in archive.infolist():
                    buffer_list.append((archive.read(item.filename), item.filename))
        return mission, buffer_list

    def _save_data(self, data: dict):
        save_data = {}
        for data_file in data:
            raw_data = data_file.split("/")[-1] + " =" + lua.encode(data[data_file])
            save_data.update({data_file: raw_data})
        with zipfile.ZipFile(self.path, mode='w', compression=zipfile.ZIP_DEFLATED) as archive_w:
            for buffer, filename in self.buffer_list:
                if filename not in save_data.keys():
                    archive_w.writestr(filename, buffer)
            for local_path in save_data:
                archive_w.writestr(local_path, save_data[local_path])

    def _update_dictionary(self):
        for key in self.key2wp:
            self.dictionary.update({key: self.key2wp[key]})

    def edit_waypoints(self, waypoints: List[WayPoint]):
        for country in self.mission['coalition']['blue']['country']:
            country_dict = self.mission['coalition']['blue']['country'][country]
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
        self._update_dictionary()
        self._save_data({'mission': self.mission, 'l10n/DEFAULT/dictionary': self.dictionary})

    def _change_group_wp(self, group_data: dict, unit_type: str, waypoints: List[WayPoint]) -> dict:
        unit_waypoints = self._get_unit_path(unit_type, waypoints)
        group_data['route']['points'] = {1: group_data['route']['points'][1]}
        for i, wp in enumerate(unit_waypoints):
            group_data = self._add_waypoint(group_data, wp, i)
        return group_data

    def _add_waypoint(self, group_data: dict, wp: WayPoint, i: int):
        point = self.point_template()
        wp_id = hashlib.sha256(wp.__repr__().encode()).hexdigest()[-4:]
        x, y = self._convert_waypoint(wp.lat, wp.lon)
        point.update({'alt': wp.altitude / 0.3048})  # altitude in mission file is meters
        point.update({'alt_type': wp.alt_type})
        point.update({'x': x})
        point.update({'y': y})
        point.update({'name': 'DictKey_WptName_' + wp_id})
        self.key2wp.update({'DictKey_WptName_' + wp_id: wp.name})
        # waypoints start from 1 and we don't touch the first waypoint (spawn place), hence i + 2
        group_data['route']['points'].update({i + 2: point})
        return group_data

    def _convert_waypoint(self, lat: float, lon: float):
        # 1 degree north = X+00110946 Z+00003945
        # 1 degree east = X-00002387 Z+00091720
        # 2 degree north = X+00221918 Z+00007507
        # 2 degree east = X-00003844 Z+00182956
        # 3 degree east = X-00004387 Z+00273724
        # 1 degree east + 1 degree north = X+00108544 Z+00094069
        lon_diff = lon - self.map_center['lon']
        lat_diff = lat - self.map_center['lat']
        y_diff = lon_diff * 91241 + lat_diff * 3754
        x_diff = lat_diff * 110959 + lon_diff * -1462
        return x_diff, y_diff

    @staticmethod
    def _get_unit_path(unit_type: str, waypoints: List[WayPoint]) -> List[WayPoint]:
        output = []
        for wp in waypoints:
            if (wp.aircraft == unit_type or wp.aircraft == "Everyone") and not wp.viz:
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


if __name__ == '__main__':
    me = MissionEditor()
