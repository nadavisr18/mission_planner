from pydantic import BaseModel


class WeatherData(BaseModel):
    city: bytes
    time: str
    session_id: str
