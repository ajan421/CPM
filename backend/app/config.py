from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Collaborative Project Management Platform"
    DEBUG_MODE: bool = False
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    API_PREFIX: str = "/api/v1"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()
