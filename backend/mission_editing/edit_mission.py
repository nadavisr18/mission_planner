from functools import lru_cache
from typing import List, Tuple
from slpp import slpp as lua
import re
import zipfile
import keras


class MissionEditor:
    def __init__(self, path: str):
        print(path)
        self.path = path
        self.buffer_dict = self._get_buffer()
        self.mission = self._get_data('mission', path)
        self.dictionary = self._get_data('l10n/DEFAULT/dictionary', path)
        self.ll2xy_model, self.xy2ll_model = self.get_models()
        self.map_center = {'lat': 35.021298, 'lon': 35.899957}

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

    @staticmethod
    @lru_cache()
    def _get_data(local_path: str, path: str) -> dict:
        with zipfile.ZipFile(path, mode='r') as archive:
            with archive.open(local_path) as msnfile:
                raw_data = msnfile.read().decode('utf-8')
                match = re.search(rf'{local_path.split("/")[-1]}\s?=', raw_data)
                data_dict = raw_data[match.end()+1:]
                data = lua.decode(data_dict)
        return data

    @staticmethod
    @lru_cache()
    def get_models():
        ll2xy_model = keras.models.load_model("backend/models/latlon_to_xy.h5")
        xy2ll_model = keras.models.load_model("backend/models/xy_to_latlon.h5")
        return ll2xy_model, xy2ll_model
