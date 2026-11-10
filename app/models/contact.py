from sqlalchemy import Column, Integer, String, DateTime, func, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    surname = Column(String(255), nullable=False)
    email = Column(String(320), nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # This sets up the many-to-many relationship with clients
    clients = relationship("Client", secondary="client_contacts", back_populates="contacts")

    # Add a composite index for sorting by Surname, then Name
    __table_args__ = (
        Index("ix_contacts_surname_name", "surname", "name"),
    )