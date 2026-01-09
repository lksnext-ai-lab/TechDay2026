from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class IncidentLogBase(BaseModel):
    author: str
    text: str

class IncidentLogCreate(IncidentLogBase):
    pass

class IncidentLog(IncidentLogBase):
    id: int
    incident_id: str
    date: datetime

    class Config:
        from_attributes = True

class IncidentBase(BaseModel):
    id: Optional[str] = None
    machine_id: str
    title: str
    description: Optional[str] = None
    status: str = "open"
    priority: str = "medium"
    reported_by: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    closed_at: Optional[datetime] = None
    mattin_id: Optional[str] = None

class Incident(IncidentBase):
    created_at: datetime
    closed_at: Optional[datetime] = None
    mattin_id: Optional[str] = None
    logs: List[IncidentLog] = []

    class Config:
        from_attributes = True

class MachineBase(BaseModel):
    id: str
    type: str
    brand: str
    model: str
    serial: str
    location: Optional[str] = None
    available: bool = True

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial: Optional[str] = None
    location: Optional[str] = None
    available: Optional[bool] = None

class Machine(MachineBase):
    class Config:
        from_attributes = True

# --- AUDIO MODULE SCHEMAS ---

class TranscriptionBase(BaseModel):
    filename: str
    content: Optional[str] = None
    sentiment: Optional[str] = None

class TranscriptionCreate(TranscriptionBase):
    pass

class Transcription(TranscriptionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
