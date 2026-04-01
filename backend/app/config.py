from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    db_host: str = "localhost"
    db_user: str = "root"
    db_password: str = "password"
    db_port: int = 3306
    db_name: str = "lamacop"
    
    # API
    debug: bool = True
    api_prefix: str = "/api/v1"
    
    # CORS
    frontend_url: str = "http://20.111.60.184/"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"

    @property
    def database_url(self) -> str:
        """Construct MySQL connection string"""
        return (
            f"mysql+mysqlconnector://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
