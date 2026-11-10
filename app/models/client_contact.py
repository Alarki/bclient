from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, Table
from app.database import Base

class ClientContact(Base):
    __tablename__ = "client_contacts"

    # Composite Primary Key: prevents duplicate links!
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), primary_key=True)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# We define the table explicitly for the SQLAlchemy relationship() to use
client_contacts_table = ClientContact.__table__