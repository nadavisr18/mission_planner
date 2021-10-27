from pydantic import BaseModel


class Mission(BaseModel):
    data: bytes
    name: str
    session_id: str
