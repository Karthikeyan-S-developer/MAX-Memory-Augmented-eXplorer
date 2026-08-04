import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "MAX")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    default_model: str = os.getenv("DEFAULT_MODEL", "llama3.1:latest")
    postgres_dsn: str = os.getenv("POSTGRES_DSN", "postgresql://max:dev@localhost:5432/max")
    vector_db_url: str = os.getenv("VECTOR_DB_URL", "http://localhost:6333")


settings = Settings()
