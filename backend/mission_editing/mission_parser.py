import os
import re
import uuid
from typing import List, Tuple, Dict, Any

import numpy as np
import yaml
from global_land_mask import globe

from backend.data_types import Group, WayPoint
from .edit_mission import MissionEditor


class MissionParser(MissionEditor):
    def __init__(self, path: str):
        with open("backend/config.yml") as file:
            self.config = yaml.load(file, Loader=yaml.FullLoader)
        super().__init__(path)

    def get_mission_info(self) -> Tuple[List[Group], str]:
        import app
        groups = []
        group_types = ('vehicle', 'plane', 'static', 'ship', 'helicopter')
        total_groups = self.get_total_groups(group_types)
        processed_groups = 0
        for coalition in self.mission['coalition'].keys():
            if coalition == "neutrals": continue
            for country in self.mission['coalition'][coalition]['country']:
                country_dict = self.mission['coalition'][coalition]['country'][country]
                raw_country_name = self.mission['coalition'][coalition]['country'][country]['name']
                country_name = self.config['CountryAliases'].get(raw_country_name, raw_country_name)
                for group_type in group_types:
                    if group_type in country_dict.keys():
                        if group_type == 'static':
                            groups_data = self.create_static_groups(country_dict[group_type]['group'], country_name,
                                                                    coalition)
                            groups.extend(groups_data)
                        else:
                            for group in country_dict[group_type]['group']:
                                group_dict = country_dict[group_type]['group'][group]
                                if coalition == 'red' and (
                                        group_dict.get("hiddenOnPlanner", False) or group_dict.get("lateActivation",
                                                                                                   False)):
                                    continue
                                radius = 0
                                unit_type = ""
                                if group_type == 'vehicle':
                                    radius, unit_type = self.check_SAM(group_dict)
                                unit_type = group_dict['units'][1]['type'] if len(unit_type) == 0 else unit_type
                                unit_type = self.config['BackendToDisplayName'].get(unit_type, unit_type)
                                client = group_dict['units'][1].get('skill') in ('Client', 'Player')
                                lat, lon = self.xy2ll.transform(group_dict['x'], group_dict['y'])
                                if not group_type == 'static':
                                    waypoints = self.get_waypoints(group_dict)
                                else:
                                    waypoints = []
                                group_data = Group(group_type=group_type,
                                                   unit_type=unit_type,
                                                   name=group_dict['name'],
                                                   country=country_name,
                                                   coalition=coalition,
                                                   lat=lat,
                                                   lon=lon,
                                                   client=client,
                                                   range=radius,
                                                   waypoints=waypoints)
                                groups.append(group_data)
                                processed_groups += 1
                                app.PROGRESS = processed_groups / total_groups
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
                    new_group['type'] = 'FARP' if static['units'][1].get("category") == 'Heliports' else new_group[
                        'type']
                    static_clumps[group_i] = new_group
                    break
            else:
                group_type = 'Base'
                group_type = 'FARP' if static['units'][1].get('category') == 'Heliports' else group_type
                new_group = {
                    'x': np.array(static['x']),
                    'y': np.array(static['y']),
                    'objects': [static_i],
                    'type': group_type
                }
                static_clumps.append(new_group)

        groups = []
        for clump in static_clumps:
            if len(clump['objects']) >= min_objects:
                lat, lon = self.xy2ll.transform(clump['x'].mean(), clump['y'].mean())
                if globe.is_land(lat, lon):
                    group = Group(group_type='static',
                                  unit_type=clump['type'],
                                  name=f"Static Group {len(groups)+1}",
                                  country=country_name,
                                  coalition=coalition,
                                  lat=lat,
                                  lon=lon)
                    groups.append(group)
        return groups

    def get_waypoints(self, group_dict: Dict) -> List[WayPoint]:
        route = group_dict.get('route', {"points": []})
        route_length = len(route['points'])
        waypoints = []
        if route_length >= 2:
            for i in range(2, route_length + 1):
                point = route['points'][i]
                lat, lon = self.xy2ll.transform(point['x'], point['y'])
                altitude = point['alt']
                group_name = group_dict['name']
                point_name = point.get("name", "")
                alt_type = point.get("alt_type", "BARO")
                wp_id = uuid.uuid4().hex
                wp = WayPoint(lat=lat, lon=lon, altitude=altitude, group=group_name, name=point_name, alt_type=alt_type,
                              wp_id=wp_id)
                waypoints.append(wp)
        return waypoints

    def get_total_groups(self, group_types: Tuple[str, str, str, str, str]) -> int:
        groups = 0
        for coalition in self.mission['coalition'].keys():
            if coalition != 'neutrals':
                for country in self.mission['coalition'][coalition]['country']:
                    country_dict = self.mission['coalition'][coalition]['country'][country]
                    for group_type in group_types:
                        if group_type in country_dict.keys() and group_type != 'static':
                            for group in country_dict[group_type]['group']:
                                group_dict = country_dict[group_type]['group'][group]
                                if coalition == 'red' and (
                                        group_dict.get("hiddenOnPlanner", False) or group_dict.get("lateActivation",
                                                                                                   False)):
                                    continue
                                groups += 1
        return groups

    @staticmethod
    def check_SAM(group: Dict) -> Tuple[int, str]:
        max_range = 0
        unit_name = ""
        range_regex = r"\[\"rangeMaxAltMax\"\] = (\d+)"
        unit_regex = r"\[\"displayName\"\] = \"(.+)\""
        for unit in group['units']:
            unit_dict = group['units'][unit]
            if unit_dict['type'] + ".lua" in os.listdir('backend/SAM_info'):
                with open(f"backend/SAM_info/{unit_dict['type']}.lua", 'r') as file:
                    raw_text = file.read()
                    try:
                        curr_range = int(re.findall(range_regex, raw_text)[0])
                    except IndexError:
                        continue
                    if curr_range > max_range:
                        max_range = curr_range
                        unit_name = re.findall(unit_regex, raw_text)[0]
        return max_range, unit_name
