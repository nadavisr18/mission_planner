from pydantic import BaseModel


class KneeboardPage(BaseModel):
    data: bytes
    aircraft: str
    name: str
