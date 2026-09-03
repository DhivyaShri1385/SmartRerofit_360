"""Centralized settings — read everywhere, hardcoded nowhere."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "SmartRetrofit 360 API"
    DATABASE_URL: str = "sqlite:///./smartretrofit.db"

    SECRET_KEY: str = "dev_secret_key_replace_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # True until real ESP32/MQTT hardware exists (Semester 2)
    SIMULATION_MODE: bool = True
    MQTT_ENABLED: bool = False

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()