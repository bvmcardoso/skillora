from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="backend/.env", env_prefix="", extra="ignore"
    )

    # App:
    app_name: str = Field("skillora", validation_alias="APP_NAME")
    environment: str = Field("development", validation_alias="ENVIRONMENT")
    debug: bool = Field(True, validation_alias="DEBUG")

    # Uploads:
    upload_dir: str = Field("/data/uploads", validation_alias="UPLOAD_DIR")

    # DB:
    db_host: str = Field("localhost", validation_alias="DB_HOST")
    db_port: int = Field(5432, validation_alias="DB_PORT")
    db_name: str = Field("skillora", validation_alias="DB_NAME")
    db_user: str = Field("user", validation_alias="DB_USER")
    db_password: str = Field("password", validation_alias="DB_PASSWORD")
    database_url_override: Optional[str] = Field(
        default=None, validation_alias="DATABASE_URL"
    )

    # Redis:
    redis_host: str = Field("redis", validation_alias="REDIS_HOST")
    redis_port: int = Field(6379, validation_alias="REDIS_PORT")

    # Auth:
    secret_key: str = Field("my_secret_key", validation_alias="SECRET_KEY")
    algorithm: str = Field("HS256", validation_alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        30, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    # URLs derivadas (preferem variáveis diretas se existirem)
    @property
    def database_url(self) -> str:
        # Async para a aplicação
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def alembic_database_url(self) -> str:
        # Sync para Alembic (evita dor de cabeça com engine async)
        return f"postgresql+psycopg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def redis_url(self) -> str:
        return f"redis://{self.redis_host}:{self.redis_port}/0"


# Pylance false positive
settings: "Settings" = Settings()  # type: ignore[call-arg]
