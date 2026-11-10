import os
from dotenv import load_dotenv

# This tells Python to read the .env file
load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")

# We create an instance so we can import it elsewhere
settings = Settings()