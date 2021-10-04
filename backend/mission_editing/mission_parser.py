from .edit_mission import MissionEditor
from backend.data_types import Group

from typing import List, Tuple, Dict, Any
import numpy as np
import uuid
import os
import re


class MissionParser(MissionEditor):
    def __init__(self, path: str):
        super().__init__(path)

    def get_mission_info(self) -> Tuple[List[Group], str]:
        groups = []
        group_types = ('vehicle', 'plane', 'static', 'ship', 'helicopter')
        for coalition in self.mission['coalition'].keys():
            for country in self.mission['coalition'][coalition]['country']:
                country_dict = self.mission['coalition'][coalition]['country'][country]
                country_name = self.mission['coalition'][coalition]['country'][country]['name']
                for group_type in group_types:
                    if group_type in country_dict.keys():
                        if group_type == 'static':
                            groups_data = self.create_static_groups(country_dict[group_type]['group'], country_name,
                                                                    coalition)
                            groups.extend(groups_data)
                        else:
                            for group in country_dict[group_type]['group']:
                                group_dict = country_dict[group_type]['group'][group]
                                radius = 0
                                if group_type == 'vehicle':
                                    radius, unit_type = self.check_SAM(group_dict)
                                unit_type = group_dict['units'][1]['type']
                                x, y = group_dict['x'] / 111139, group_dict['y'] / 111139
                                lat_diff, lon_diff = self.xy2ll_model.predict([[x, y], ])[0]
                                lat, lon = self.map_center['lat'] + lat_diff, self.map_center['lon'] + lon_diff
                                group_data = Group(group_type=group_type,
                                                   unit_type=unit_type,
                                                   name=group_dict['name'],
                                                   country=country_name,
                                                   coalition=coalition,
                                                   lat=lat,
                                                   lon=lon,
                                                   range=radius)
                                groups.append(group_data)

        return groups, self.mission['theatre']

    def create_static_groups(self, static_objects: Dict[int, Dict[str, Any]], country_name: str, coalition: str,
                             max_dist: int = 1000, min_objects: int = 5) -> List[Group]:
        """
        :param static_objects: the static objects from the mission.lua file
        :param country_name: the static objects' country
        :param coalition: blue or red
        :param max_dist: maximum distance of a static from a group to be in that group
        :param min_objects: minimum amount of objects to be considered a base
        :return: list of groups
        """
        dist = lambda p1, p2: np.sqrt(((p1[0] - p2[0]) ** 2) + ((p1[1] - p2[1]) ** 2))
        static_clumps = []
        for static_i, static in static_objects.items():
            for group_i, group in enumerate(static_clumps):
                if dist((group['x'].mean(), group['y'].mean()), (static['x'], static['y'])) < max_dist:
                    new_group = group.copy()
                    new_group['x'] = np.append(new_group['x'], static['x'])
                    new_group['y'] = np.append(new_group['y'], static['y'])
                    new_group['objects'].append(static_i)
                    new_group['type'] = 'FARP' if static['units'][1]['category'] == 'Heliports' else new_group['type']
                    static_clumps[group_i] = new_group
                    break
            else:
                new_group = {
                    'x': np.array(static['x']),
                    'y': np.array(static['y']),
                    'objects': [static_i],
                    'type': 'FARP' if static['units'][1]['category'] == 'Heliports' else 'Base'
                }
                static_clumps.append(new_group)

        groups = []
        for clump in static_clumps:
            if len(clump['objects']) >= min_objects:
                x, y = clump['x'].mean() / 111139, clump['y'].mean() / 111139
                lat_diff, lon_diff = self.xy2ll_model.predict([[x, y], ])[0]
                lat, lon = self.map_center['lat'] + lat_diff, self.map_center['lon'] + lon_diff
                group = Group(group_type='static',
                              unit_type=clump['type'],
                              name=uuid.uuid4().hex,
                              country=country_name,
                              coalition=coalition,
                              lat=lat,
                              lon=lon)
                groups.append(group)
        return groups

    @staticmethod
    def check_SAM(group: Dict) -> Tuple[int, str]:
        max_range = 0
        unit_name = ""
        range_regex = r"\[\"rangeMaxAltMax\"\] = (\d+)"
        unit_regex = r"\[\"displayName\"\] = \"(.+)\""
        for unit in group['units']:
            unit_dict = group['units'][unit]
            if unit_dict['type'] +".lua" in os.listdir('backend/SAM_info'):
                with open(f"backend/SAM_info/{unit_dict['type']}.lua", 'r') as file:
                    raw_text = file.read()
                    try:
                        curr_range = int(re.findall(range_regex, raw_text)[0])
                    except IndexError:
                        continue
                    if curr_range > max_range:
                        max_range = curr_range
                        print(unit_dict['type'])
                        unit_name = re.findall(unit_regex, raw_text)[0]
        return max_range, unit_name
