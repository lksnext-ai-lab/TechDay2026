from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial = Column(String, unique=True, index=True)
    location = Column(String)
    available = Column(Boolean, default=True)

    incidents = relationship("Incident", back_populates="machine")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="open") # open, in_progress, resolved, closed
    priority = Column(String, default="medium") # low, medium, high, critical
    reported_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    machine = relationship("Machine", back_populates="incidents")
    logs = relationship("IncidentLog", back_populates="incident", cascade="all, delete-orphan")

class IncidentLog(Base):
    __tablename__ = "incident_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"))
    author = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())

    incident = relationship("Incident", back_populates="logs")

# You can add other module's models here as needed, 
# ensuring they are independent or properly related.

class Transcription(Base):
    __tablename__ = "transcriptions"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    sentiment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
