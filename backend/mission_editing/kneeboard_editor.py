import base64

from .edit_mission import MissionEditor


class KneeboardEditor(MissionEditor):
    def __init__(self, path: str):
        super().__init__(path)

    def add_page(self, data: bytes, name: str, aircraft: str):
        if aircraft.lower() != "everyone":
            path = f"KNEEBOARD\\IMAGES\\{aircraft}\\{name}"
        else:
            path = f"KNEEBOARD\\IMAGES\\{name}"
        binary_data = base64.decodebytes(data)
        self._save_binary_data({path: binary_data})

    def remove_page(self, name: str, aircraft: str):
        if aircraft.lower() != "everyone":
            path = f"KNEEBOARD\\IMAGES\\{aircraft}\\{name}"
        else:
            path = f"KNEEBOARD\\IMAGES\\{name}"
        self._remove_file(path)