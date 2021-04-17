from typing import List, Tuple
from slpp import slpp as lua
import zipfile


class MissionEditor:
    def __init__(self, path: str):
        self.path = path
        _, self.buffer_list = self._get_data('mission')  # mission doesn't matter, just for getting the buffer list

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
