from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# 1. Create the engine (the actual connection to the DB)
engine = create_engine(settings.DATABASE_URL)

# 2. Create a SessionLocal class. Each request will use one of these.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create a Base class. Our database models will inherit from this.
Base = declarative_base()

# 4. A dependency to get the database session, and close it when done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()