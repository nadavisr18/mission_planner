import re
import zipfile
from functools import lru_cache
from threading import Thread

from pyproj import CRS, Transformer
from slpp import slpp as lua

import backend.theatres as theatres
from backend.theatres.transverse_mercator import TransverseMercator


class MissionEditor:
    def __init__(self, path: str):
        self.path = path
        self.buffer_dict = self._get_buffer()

        mission_p = Thread(target=self._get_data, args=('mission', path))
        mission_p.start()
        dictionary_p = Thread(target=self._get_data, args=('l10n/DEFAULT/dictionary', path))
        dictionary_p.start()

        mission_p.join()
        dictionary_p.join()

        self.mission = self._get_data('mission', path)
        self.dictionary = self._get_data('l10n/DEFAULT/dictionary', path)

        projection_parameters = self.get_params(self.mission['theatre'])
        self.ll2xy = Transformer.from_crs(
            CRS("WGS84"), projection_parameters.to_crs()
        )
        self.xy2ll = Transformer.from_crs(
            projection_parameters.to_crs(), CRS("WGS84")
        )

    def _get_buffer(self) -> dict:
        """
        get the current state of the miz file
        """
        with zipfile.ZipFile(self.path, mode='r') as archive:
            buffer_dict = {}
            for item in archive.infolist():
                buffer_dict.update({item.filename: archive.read(item.filename)})
        return buffer_dict

    def _save_lua_data(self, data: dict):
        save_data = {}
        for data_file in data:
            raw_data = data_file.split("/")[-1] + " =\n" + lua.encode(data[data_file])
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
    def get_params(theatre: str) -> TransverseMercator:
        if theatre == "Syria":
            return theatres.SYRIA_PARAMS
        if theatre == "Nevada":
            return theatres.NEVADA_PARAMS
        if theatre == "Caucasus":
            return theatres.CAUCASUS_PARAMS
        if theatre == "PersianGulf":
            return theatres.PERSIAN_GULF_PARAMS

    @staticmethod
    @lru_cache()
    def _get_data(local_path: str, path: str):
        with zipfile.ZipFile(path, mode='r') as archive:
            with archive.open(local_path) as msnfile:
                raw_data = msnfile.read().decode('utf-8')
                match = re.search(rf'{local_path.split("/")[-1]}\s?=', raw_data)
                data_dict = raw_data[match.end()+1:]
                data_dict = re.sub(r"--.+\n", "\n", data_dict)
                data = lua.decode(data_dict)
        return data

