from pydantic import BaseModel


class WeatherData(BaseModel):
    city: str
    time: str
    session_id: str
