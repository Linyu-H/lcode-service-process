from __future__ import annotations
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    host: str = "127.0.0.1"
    port: int = 8765
    database_url: str = "sqlite:///./app_data/app.db"
    data_dir: str = "./app_data"
    log_level: str = "INFO"
    app_name: str = "Lcode Service Process"
    api_prefix: str = "/api/v1"

    model_config = SettingsConfigDict(env_prefix="LCODE_", env_file=".env", extra="ignore")

    @property
    def data_path(self) -> Path:
        path = Path(self.data_dir).expanduser().resolve()
        path.mkdir(parents=True, exist_ok=True)
        (path / "logs").mkdir(parents=True, exist_ok=True)
        return path

settings = Settings()
