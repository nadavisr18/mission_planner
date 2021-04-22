from .edit_mission import MissionEditor

import base64


class KneeboardEditor(MissionEditor):
    def __init__(self, path: str):
        super().__init__(path)
        self.kneeboard_path = "KNEEBOARD\\IMAGES"

    def add_page(self, data: bytes, aircraft: str):
        if aircraft.lower() != "everyone":
            self.kneeboard_path.replace("\\", f"\\{aircraft}\\")
        binary_data = base64.decodebytes(data)
        self._save_binary_data({self.kneeboard_path: binary_data})
