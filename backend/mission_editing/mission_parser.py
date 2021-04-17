from .edit_mission import MissionEditor


class MissionParser(MissionEditor):
    def __init__(self, path: str):
        super().__init__(path)

    def get_client_aircraft_types(self) -> list:
        types = []
        for country in self.mission['coalition']['blue']['country']:
            country_dict = self.mission['coalition']['blue']['country'][country]
            for group in country_dict['plane']['group']:
                group_dict = country_dict['plane']['group'][group]
                for unit in group_dict['units']:
                    unit_dict = group_dict['units'][unit]
                    skill = unit_dict['skill']
                    if skill == 'Client':
                        types.append(unit_dict['type'])
        return list(set(types))
