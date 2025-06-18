from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "skillora"
    environment: str = "development"
    debug: bool = True
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "skillora"
    db_user: str = "user"
    db_password: str = "password"
    redis_host: str = "redis"
    redis_port: int = 6379


settings = Settings()
print("✅ Config OK:", settings)
