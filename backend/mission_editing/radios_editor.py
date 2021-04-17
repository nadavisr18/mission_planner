from .edit_mission import MissionEditor


class RadiosEditor(MissionEditor):
    def __init__(self, path):
        super().__init__(path)

    def set_radios(self, presets: dict):
        for country in self.mission['coalition']['blue']['country']:
            country_dict = self.mission['coalition']['blue']['country'][country]
            for group in country_dict['plane']['group']:
                group_dict = country_dict['plane']['group'][group]
                for unit in group_dict['units']:
                    unit_dict = group_dict['units'][unit]
                    skill = unit_dict['skill']
                    unit_type = unit_dict['type']
                    if skill == 'Client' and unit_type in presets.keys():
                        unit_presets = presets[unit_type]
                        for radio in unit_presets.keys():
                            for channel in unit_presets[radio].keys():
                                unit_dict['Radio'][int(radio)]['channels'][int(channel)] = presets[unit_type][radio][
                                    channel]
                        if "1" in presets[unit_type].keys() and "1" in presets[unit_type]["1"].keys():
                            group_dict['frequency'] = presets[unit_type]["1"]["1"]
                    group_dict['units'][unit] = unit_dict
                country_dict['plane']['group'][group] = group_dict
            self.mission['coalition']['blue']['country'][country] = country_dict
        self._save_lua_data({"mission": self.mission})
