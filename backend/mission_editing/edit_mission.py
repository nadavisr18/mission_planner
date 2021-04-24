from typing import List, Tuple
from slpp import slpp as lua
import zipfile


class MissionEditor:
    def __init__(self, path: str):
        self.path = path
        self.buffer_dict = self._get_buffer()
        self.mission = self._get_data('mission')
        self.dictionary = self._get_data('l10n/DEFAULT/dictionary')

    def _get_data(self, local_path: str) -> dict:
        with zipfile.ZipFile(self.path, mode='r') as archive:
            with archive.open(local_path) as msnfile:
                raw_data = msnfile.read().decode('utf-8')
                data_dict = raw_data.split(local_path.split("/")[-1] + " =")[1]
                data = lua.decode(data_dict)
        return data

    def _get_buffer(self) -> dict:
        with zipfile.ZipFile(self.path, mode='r') as archive:
            buffer_dict = {}
            for item in archive.infolist():
                buffer_dict.update({item.filename: archive.read(item.filename)})
        return buffer_dict

    def _save_lua_data(self, data: dict):
        save_data = {}
        for data_file in data:
            raw_data = data_file.split("/")[-1] + " =" + lua.encode(data[data_file])
            save_data.update({data_file: raw_data})
        with zipfile.ZipFile(self.path, mode='w', compression=zipfile.ZIP_DEFLATED) as archive_w:
            for filename, buffer in self.buffer_dict.items():
                if filename not in save_data.keys():
                    archive_w.writestr(filename, buffer)
            for local_path in save_data:
                archive_w.writestr(local_path, save_data[local_path])
        self.buffer_dict = self._get_buffer()

    def _save_binary_data(self, data: dict):
        with zipfile.ZipFile(self.path, mode='w', compression=zipfile.ZIP_DEFLATED) as archive_w:
            for filename, buffer in self.buffer_dict.items():
                if filename not in data.keys():
                    archive_w.writestr(filename, buffer)
            for local_path in data:
                archive_w.writestr(local_path, data[local_path])
        self.buffer_dict = self._get_buffer()

    def _remove_file(self, path):
        with zipfile.ZipFile(self.path, mode='w', compression=zipfile.ZIP_DEFLATED) as archive_w:
            for filename, buffer in self.buffer_dict.items():
                if filename != path:
                    archive_w.writestr(filename, buffer)
        self.buffer_dict = self._get_buffer()
