from backend.data_types import RadioPresets
from .edit_mission import MissionEditor


class RadiosEditor(MissionEditor):
    def __init__(self, path):
        super().__init__(path)

    def set_radios(self, presets: RadioPresets):
        for country in self.mission['coalition']['blue']['country']:
            country_dict = self.mission['coalition']['blue']['country'][country]
            if 'plane' not in country_dict.keys():
                continue
            for group in country_dict['plane']['group']:
                group_dict = country_dict['plane']['group'][group]
                for unit in group_dict['units']:
                    unit_dict = group_dict['units'][unit]
                    skill = unit_dict['skill']
                    group_name = group_dict['name']
                    if skill == 'Client' and (group_name == presets.group or presets.group.lower() == "everyone"):
                        unit_presets = presets.channels_presets
                        for preset in unit_presets:
                            radio, channel, frequency = preset.dict().values()
                            if "Radio" in unit_dict.keys():
                                unit_dict['Radio'][radio]['channels'][channel] = frequency
                            if radio == 1 and channel == 1:
                                group_dict['frequency'] = frequency
                    group_dict['units'][unit] = unit_dict
                country_dict['plane']['group'][group] = group_dict
            self.mission['coalition']['blue']['country'][country] = country_dict
        self._save_lua_data({"mission": self.mission})
