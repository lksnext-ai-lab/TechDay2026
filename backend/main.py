import os
import httpx
from typing import List
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas

# Create tables (already managed by alembic, but good to have)
# Base.metadata.create_all(bind=engine)

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

app = FastAPI(title="LKS Tech Day BFF")


# ... middleware ...
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MATTIN_URL = os.getenv("MATTIN_URL", "https://aict-desa.lksnext.com")
API_KEY = os.getenv("API_KEY")

@app.on_event("startup")
async def startup_event():
    print("="*50)
    print(f"LOADING ENV FROM: {dotenv_path}")
    print(f"MATTIN_URL: {MATTIN_URL}")
    if API_KEY:
        print(f"API_KEY: LOADED (Length: {len(API_KEY)})")
    else:
        print("API_KEY: NOT FOUND!")
    print("="*50)

# --- SAT MODULE ENDPOINTS ---

@app.get("/api/sat/machines", response_model=List[schemas.Machine])
def get_machines(db: Session = Depends(get_db)):
    return db.query(models.Machine).all()

@app.get("/api/sat/incidents", response_model=List[schemas.Incident])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).order_by(models.Incident.created_at.desc()).all()

@app.post("/api/sat/incidents", response_model=schemas.Incident)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    import uuid
    db_incident = models.Incident(**incident.dict())
    # Ensure ID is unique if not provided
    if not db_incident.id:
        db_incident.id = f"INC-{uuid.uuid4().hex[:8].upper()}"
    
    db.add(db_incident)
    
    # Initial log
    db_log = models.IncidentLog(
        incident_id=db_incident.id,
        author="Sistema",
        text="Incidencia creada."
    )
    db.add(db_log)
    
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.patch("/api/sat/incidents/{incident_id}", response_model=schemas.Incident)
def update_incident(incident_id: str, updates: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_incident, key, value)
    
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.post("/api/sat/incidents/{incident_id}/logs", response_model=schemas.IncidentLog)
def add_incident_log(incident_id: str, log: schemas.IncidentLogCreate, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db_log = models.IncidentLog(incident_id=incident_id, **log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# --- CHAT MODULE ENDPOINTS ---

@app.post("/api/chat/{app_id}/{agent_id}/reset")
async def reset_chat(app_id: int, agent_id: int):
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{agent_id}/reset"
    headers = {"X-API-KEY": API_KEY}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/{app_id}/{agent_id}/call")
async def chat_call(app_id: int, agent_id: int, request: Request):
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{agent_id}/call"
    headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    body = await request.json()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=body)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
