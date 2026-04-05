from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Optional full SQLAlchemy URL. If provided, this takes precedence.
    database_url_raw: str | None = Field(default=None, alias="DATABASE_URL")

    # SQLAlchemy driver for composed URL mode.
    db_driver: str = "mysql+pymysql"
    
    # Database
    db_host: str
    db_user: str
    db_password: str
    db_port: int = 3306
    db_name: str
    
    # API
    debug: bool = True
    api_prefix: str = "/api/v1"
    
    # CORS
    frontend_url: str = "http://localhost:3000"

    # Azure Blob Storage
    azure_storage_connection_string: str | None = Field(default=None, alias="AZURE_STORAGE_CONNECTION_STRING")
    azure_storage_account_name: str | None = Field(default=None, alias="AZURE_STORAGE_ACCOUNT_NAME")
    azure_storage_account_key: str | None = Field(default=None, alias="AZURE_STORAGE_ACCOUNT_KEY")
    azure_storage_container_name: str = Field(default="lamacop-media", alias="AZURE_STORAGE_CONTAINER_NAME")
    
    class Config:
        case_sensitive = False
        extra = "allow"

    @property
    def database_url(self) -> URL | str:
        """Get database URL from DATABASE_URL or compose it from DB_* variables."""
        if self.database_url_raw:
            return self.database_url_raw

        return URL.create(
            self.db_driver,
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
        )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
