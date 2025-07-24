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
    
    secret_key: str = "my_secret_key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    @property
    def database_url(self):
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
print("✅ Config OK:", settings)
