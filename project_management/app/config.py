from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "Collaborative Project Management Platform"
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "False") == "True"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    API_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
