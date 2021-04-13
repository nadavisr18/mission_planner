from slpp import slpp as lua
import hashlib
import zipfile
import math
import numpy as np


class MissionEditor:
    def __init__(self, path: str):
        self.path = path
        self.mission, self.buffer_list = self.get_data('mission')
        self.dictionary, _ = self.get_data('l10n/DEFAULT/dictionary')
        self.key2wp = {}
        self.map_center = {"y": 96596.571428573, 'x': 29807.0, 'lat': 35.021298, 'lon': 35.899957}

    def get_data(self, local_path):
        with zipfile.ZipFile(self.path, mode='r') as archive:
            with archive.open(local_path) as msnfile:
                raw_mission = msnfile.read().decode('utf-8')
                mission_dict = raw_mission.split(local_path.split("/")[-1] + " =")[1]
                mission = lua.decode(mission_dict)
                buffer_list = []
                for item in archive.infolist():
                    buffer_list.append((archive.read(item.filename), item.filename))
        return mission, buffer_list

    def save_data(self, data):
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

    def edit_dictionary(self):
        for key in self.key2wp:
            self.dictionary.update({key: self.key2wp[key]})

    def edit_waypoints(self, waypoints):
        for country in self.mission['coalition']['blue']['country']:
            country_dict = self.mission['coalition']['blue']['country'][country]
            for group in country_dict['plane']['group']:
                group_dict = country_dict['plane']['group'][group]
                for unit in group_dict['units']:
                    unit_dict = group_dict['units'][unit]
                    skill = unit_dict['skill']
                    if skill == 'Client':
                        group_dict = self.change_group_wp(group_dict, unit_dict['type'], waypoints)
                        country_dict['plane']['group'][group] = group_dict
                        break
            self.mission['coalition']['blue']['country'][country] = country_dict
        self.edit_dictionary()
        self.save_data({'mission': self.mission, 'l10n/DEFAULT/dictionary': self.dictionary})

    def change_group_wp(self, group_dict, unit_type, waypoints):
        unit_waypoints = self.get_unit_path(unit_type, waypoints)
        group_dict['route']['points'] = {1: group_dict['route']['points'][1]}
        for i, wp in enumerate(unit_waypoints):
            group_dict = self.add_waypoint(group_dict, wp, i)
        return group_dict

    def add_waypoint(self, group_dict, wp, i):
        point = self.point_template()
        wpid = hashlib.sha256(wp.__repr__().encode()).hexdigest()[-4:]
        x, y = self.convert_waypoint(wp.lat, wp.lon)
        point.update({'alt': wp.altitude / 0.3048})
        point.update({'alt_type': wp.alt_type})
        point.update({'x': x})
        point.update({'y': y})
        point.update({'name': 'DictKey_WptName_' + wpid})
        self.key2wp.update({'DictKey_WptName_' + wpid: wp.name})
        group_dict['route']['points'].update({i + 2: point})
        return group_dict

    def convert_waypoint(self, lat, lon):
        lon_diff = lon - self.map_center['lon']
        lat_diff = lat - self.map_center['lat']
        y_diff = lon_diff * 91744
        x_diff = lat_diff * 110489
        return x_diff, y_diff

    @staticmethod
    def get_unit_path(unit_type, waypoints):
        output = []
        for wp in waypoints:
            if (wp.aircraft == unit_type or wp.aircraft == "Everyone") and not wp.viz:
                output.append(wp)
        return output

    @staticmethod
    def point_template():
        temp = {'alt': 0,
                'action': 'Turning Point',
                'alt_type': 'BARO',
                'speed': 350,
                'task': {'id': 'ComboTask', 'params': {'tasks': {}}},
                'type': 'Turning Point',
                'ETA': 222.09261818747,
                'ETA_locked': False,
                'y': 630705.49543577,
                'x': -217613.56066099,
                'name': 'DictKey_WptName_',
                'formation_template': '',
                'speed_locked': True}
        return temp


if __name__ == '__main__':
    me = MissionEditor()
