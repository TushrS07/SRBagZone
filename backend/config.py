from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Either DATABASE_URL OR the SERVER_HOST/PORT/etc set is allowed.
    # The split form is required when the database name contains spaces
    # (e.g. "SR Bagz Zone"), which can't survive URL parsing.
    database_url: str = ""
    server_host: str = ""
    server_port: int = 5432
    database_name: str = ""
    database_user: str = ""
    database_password: str = ""

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    allowed_origins: str = "http://localhost:5173"
    app_env: str = "development"
    frontend_url: str = "http://localhost:5173"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
