from .edit_mission import MissionEditor
from backend.data_types import Group

from typing import List, Tuple


class MissionParser(MissionEditor):
    def __init__(self, path: str):
        super().__init__(path)

    def get_mission_info(self) -> Tuple[List[Group], str]:
        groups = []
        group_types = ('vehicle', 'plane', 'static', 'ship', 'helicopter')
        for coalition in self.mission['coalition'].keys():
            for country in self.mission['coalition'][coalition]['country']:
                country_dict = self.mission['coalition']['blue']['country'][country]
                for group_type in group_types:
                    if group_type in country_dict.keys():
                        if group_type == 'static':
                            groups_data = self.create_static_groups(country_dict[group_type]['group'])
                            groups.extend(groups_data)
                        else:
                            for group in country_dict[group_type]['group']:
                                group_dict = country_dict[group_type]['group'][group]
                                unit_type = group_dict['units'][1]['type']
                                x, y = group_dict['x'] / 111139, group_dict['y'] / 111139
                                lat_diff, lon_diff = self.xy2ll_model.predict([[x, y], ])[0]
                                lat, lon = self.map_center['lat'] + lat_diff, self.map_center['lon'] + lon_diff
                                group_data = Group(group_type=group_type,
                                                   unit_type=unit_type,
                                                   name=group_dict['name'],
                                                   country=country,
                                                   coalition=coalition,
                                                   lat=lat,
                                                   lon=lon)
                                groups.append(group_data)

        return groups, self.mission['theatre']
