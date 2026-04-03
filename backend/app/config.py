from pydantic_settings import BaseSettings
from functools import lru_cache
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
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
    
    class Config:
        case_sensitive = False
        extra = "allow"

    @property
    def database_url(self) -> str:
        """Construct MySQL connection string"""
        return str(
            URL.create(
                "mysql+mysqlconnector",
                username=self.db_user,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
            )
        )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
