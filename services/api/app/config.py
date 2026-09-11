from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    DATABASE_URL: str
    GEMINI_API_KEY: str
    GEMINI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    JWT_SECRET: str = "odhikar-secret-key-bangladesh-legal-aid"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()