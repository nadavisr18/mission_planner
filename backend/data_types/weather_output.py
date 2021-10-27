from pydantic import BaseModel


class WeatherOutput(BaseModel):
    condition: str
    wind_dir: str
    wind_speed: str
    city: str
    icon: str
