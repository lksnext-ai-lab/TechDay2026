import os
import httpx
from typing import List, Optional
from fastapi import FastAPI, Request, HTTPException, Depends, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import shutil
import glob
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
from modules import swarm, audio, mcp

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

# Ensure uploads directory exists
UPLOADS_DIR = "uploads"
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.include_router(swarm.router)
app.include_router(audio.router)
app.include_router(mcp.router)

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

# --- MATTIN AI HELPERS ---

async def index_with_mattin(app_id: int, silo_id: str, incident: models.Incident):
    if not app_id or not silo_id:
        print("DEBUG: Missing appId or siloId for Mattin indexing")
        return None
        
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/silos/silos/{silo_id}/docs/index"
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}
    
    # Combine content: description + all logs
    logs_content = "\n".join([f"[{log.date}] {log.author}: {log.text}" for log in incident.logs])
    content = f"INCIDENCIA: {incident.title}\nDESCRIPCIÓN: {incident.description}\n\nACTIVIDAD:\n{logs_content}"
    
    payload = {
        "content": content,
        "metadata": {
            "title": incident.title,
            "tipo": incident.machine.type if incident.machine else "Desconocido",
            "modelo": incident.machine.model if incident.machine else "Desconocido",
            "incident_id": incident.id
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Indexing incident {incident.id} to Mattin...")
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            res_data = response.json()
            # The documentation says it returns an ID. Usually res_data["id"] 
            # but we'll accept what the API returns.
            return res_data.get("id")
        except Exception as e:
            print(f"ERROR INDEXING TO MATTIN: {str(e)}")
            return None

async def unindex_from_mattin(app_id: int, silo_id: str, mattin_id: str):
    if not app_id or not silo_id or not mattin_id:
        return
        
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/silos/silos/{silo_id}/docs/delete"
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}
    payload = {"ids": [mattin_id]}
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Unindexing doc {mattin_id} from Mattin...")
            # httpx.request with body for DELETE
            response = await client.request("DELETE", url, headers=headers, json=payload)
            response.raise_for_status()
        except Exception as e:
            print(f"ERROR UNINDEXING FROM MATTIN: {str(e)}")

async def search_mattin_incidents(app_id: int, silo_id: str, query: str, machine_type: str = None, k: int = 4):
    if not app_id or not silo_id:
        return []
        
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/silos/silos/{silo_id}/docs/find"
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}
    
    payload = {
        "query": query,
        "k": k
    }
    
    if machine_type:
        payload["filter_metadata"] = {
             "tipo": machine_type
        }
        
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Searching Mattin with query: {query[:50]}...")
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            # print(f"DEBUG: Search response: {data}")
            return data.get("docs", [])
        except Exception as e:
            print(f"ERROR SEARCHING MATTIN INCIDENTS: {str(e)}")
            return []

async def search_mattin_docs(app_id: int, silo_id: str, query: str, machine_type: str = None, machine_model: str = None, k: int = 5):
    """
    Searches the document silo for relevant chunks.
    """
    if not app_id or not silo_id:
        print("DEBUG: Missing app_id or silo_id for doc search")
        return []
        
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/silos/silos/{silo_id}/docs/find"
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}
    
    payload = {
        "query": query,
        "k": k
    }
    
    # Filter by machine type and model if available
    filters = {}
    if machine_type:
        filters["tipo"] = machine_type
    if machine_model:
        filters["modelo"] = machine_model
        
    if filters:
        payload["filter_metadata"] = filters
        
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Searching Mattin Docs with query: {query[:50]}... Filters: {filters}")
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("docs", [])
        except Exception as e:
            print(f"ERROR SEARCHING MATTIN DOCS: {str(e)}")
            return []

async def unindex_mattin_doc(app_id: int, silo_id: str, metadata: dict):
    """
    Unindexes documents from Mattin based on metadata filter.
    URL: /public/v1/app/{app_id}/silos/silos/{silo_id}/docs/delete-by-metadata
    """
    if not app_id or not silo_id or not metadata:
        return
        
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/silos/silos/{silo_id}/docs/delete-by-metadata"
    headers = {"X-API-KEY": API_KEY, "Content-Type": "application/json"}
    
    payload = {
        "filter_metadata": metadata
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Unindexing from Mattin: {metadata}")
            # delete-by-metadata expects DELETE method
            response = await client.request("DELETE", url, headers=headers, json=payload)
            response.raise_for_status()
            print("DEBUG: Unindexing success")
        except Exception as e:
            print(f"ERROR UNINDEXING DOC: {str(e)}")

async def index_mattin_doc(app_id: int, silo_id: str, file_path: str, metadata: dict):
    """
    Indexes a file to Mattin.
    URL: /public/v1/app/{app_id}/silos/silos/{silo_id}/docs/index-file
    """
    if not app_id or not silo_id or not os.path.exists(file_path):
        return
        
    # First unindex to ensure clean state
    await unindex_mattin_doc(app_id, silo_id, metadata)
    
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/silos/silos/{silo_id}/docs/index-file"
    headers = {"X-API-KEY": API_KEY}
    
    # Multipart form data
    # file * string($binary)
    # metadata string (json string)
    
    import json
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Indexing to Mattin: {file_path} with meta {metadata}")
            
            with open(file_path, "rb") as f:
                files = {
                    "file": (os.path.basename(file_path), f, "application/pdf")
                }
                data = {
                    "metadata": json.dumps(metadata)
                }
                
                response = await client.post(url, headers=headers, files=files, data=data)
                response.raise_for_status()
                print("DEBUG: Indexing success")
                
        except Exception as e:
            print(f"ERROR INDEXING DOC: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error indexing document: {str(e)}")

# --- SAT MODULE ENDPOINTS ---

@app.get("/api/sat/machines", response_model=List[schemas.Machine])
def get_machines(db: Session = Depends(get_db)):
    return db.query(models.Machine).filter(models.Machine.available == True).all()

@app.post("/api/sat/machines", response_model=schemas.Machine)
def create_machine(machine: schemas.MachineCreate, db: Session = Depends(get_db)):
    if not machine.id or not machine.id.strip():
        raise HTTPException(status_code=400, detail="El ID del modelo no puede estar vacío.")
        
    db_machine = models.Machine(**machine.dict())
    try:
        db.add(db_machine)
        db.commit()
        db.refresh(db_machine)
        return db_machine
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/sat/machines/{machine_id}", response_model=schemas.Machine)
def update_machine(machine_id: str, machine: schemas.MachineUpdate, db: Session = Depends(get_db)):
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    update_data = machine.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_machine, key, value)
        
    db.commit()
    db.refresh(db_machine)
    return db_machine

@app.delete("/api/sat/machines/{machine_id}")
def delete_machine(machine_id: str, db: Session = Depends(get_db)):
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
        
    db_machine.available = False
    db.commit()
    return {"status": "success", "message": "Machine marked as unavailable (deleted)"}

@app.post("/api/sat/machines/{machine_id}/documents")
async def upload_machine_document(machine_id: str, file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    machine_dir = os.path.join(UPLOADS_DIR, "electrodomesticos", machine_id)
    if not os.path.exists(machine_dir):
        os.makedirs(machine_dir)

    # Use original filename
    filename = os.path.basename(file.filename)
    file_path = os.path.join(machine_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": filename, "url": f"/uploads/electrodomesticos/{machine_id}/{filename}"}

@app.get("/api/sat/machines/{machine_id}/documents")
def get_machine_documents(machine_id: str):
    machine_dir = os.path.join(UPLOADS_DIR, "electrodomesticos", machine_id)
    if not os.path.exists(machine_dir):
        return []

    documents = []
    # List all PDFs
    files = sorted(glob.glob(os.path.join(machine_dir, "*.pdf")))
    for f in files:
        filename = os.path.basename(f)
        documents.append({
            "filename": filename,
            "url": f"/uploads/electrodomesticos/{machine_id}/{filename}"
        })
    return documents
@app.post("/api/sat/machines/{machine_id}/documents/{filename}/index")
async def index_machine_document(
    machine_id: str, 
    filename: str, 
    app_id: int = Query(...), 
    silo_id: str = Query(...),
    db: Session = Depends(get_db)
):
    # Verify machine exists
    machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
        
    machine_dir = os.path.join(UPLOADS_DIR, "electrodomesticos", machine_id)
    file_path = os.path.join(machine_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document not found")
        
    metadata = {
        "tipo": machine.type,
        "modelo": machine.model,
        "nombre": filename
    }
    
    await index_mattin_doc(app_id, silo_id, file_path, metadata)
    
    return {"status": "success", "message": "Document indexed"}

@app.delete("/api/sat/machines/{machine_id}/documents/{filename}")
async def delete_machine_document(
    machine_id: str, 
    filename: str,
    app_id: int = Query(None), 
    silo_id: str = Query(None),
    db: Session = Depends(get_db)
):
    machine_dir = os.path.join(UPLOADS_DIR, "electrodomesticos", machine_id)
    file_path = os.path.join(machine_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Unindex if app_id/silo_id provided
    if app_id and silo_id:
        machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
        if machine:
            metadata = {
                "tipo": machine.type,
                "modelo": machine.model,
                "nombre": filename
            }
            await unindex_mattin_doc(app_id, silo_id, metadata)
    
    # Delete file
    try:
        os.remove(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
        
    return {"status": "success", "message": "Document deleted"}

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
async def update_incident(incident_id: str, updates: schemas.IncidentUpdate, app_id: Optional[int] = None, silo_id: Optional[str] = None, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    old_status = db_incident.status
    update_data = updates.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_incident, key, value)
    
    # Trigger indexing if status changed to 'resolved'
    if old_status != "resolved" and db_incident.status == "resolved":
        m_id = await index_with_mattin(app_id, silo_id, db_incident)
        if m_id:
            db_incident.mattin_id = m_id
    
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.delete("/api/sat/incidents/{incident_id}")
async def delete_incident(incident_id: str, app_id: Optional[int] = None, silo_id: Optional[str] = None, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Unindex if it was indexed
    if db_incident.mattin_id:
        await unindex_from_mattin(app_id, silo_id, db_incident.mattin_id)
    
    db.delete(db_incident)
    db.commit()
    return {"status": "success", "message": "Incident deleted"}

@app.get("/api/sat/incidents/{incident_id}/similar")
async def get_similar_incidents(incident_id: str, app_id: Optional[int] = None, silo_id: Optional[str] = None, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    query_text = f"{db_incident.title}\n{db_incident.description}"
    machine_type = db_incident.machine.type if db_incident.machine else None
    
    similar_docs = await search_mattin_incidents(app_id, silo_id, query_text, machine_type)
    
    # Extract IDs and map to scores
    similar_map = {}
    for doc in similar_docs:
        meta = doc.get("metadata", {})
        inc_id = meta.get("incident_id")
        if inc_id and inc_id != incident_id:
            similar_map[inc_id] = doc.get("score", 0)
            
    if not similar_map:
        return []

    # Fetch full details from DB
    similar_db_incidents = db.query(models.Incident).filter(models.Incident.id.in_(similar_map.keys())).all()
    
    results = []
    for inc in similar_db_incidents:
        results.append({
            "id": inc.id,
            "title": inc.title,
            "description": inc.description,
            "logs": [{"author": log.author, "date": log.date, "text": log.text} for log in inc.logs],
            "similarity": similar_map.get(inc.id, 0),
            "metadata": {"modelo": inc.machine.model if inc.machine else "Desconocido"}
        })
        
    # Sort by similarity desc
    results.sort(key=lambda x: x["similarity"], reverse=True)
        
    return results

@app.get("/api/sat/incidents/{incident_id}/knowledge")
async def get_incident_knowledge(incident_id: str, app_id: Optional[int] = None, silo_id: Optional[str] = None, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    query_text = f"{db_incident.title}\n{db_incident.description}"
    machine_type = db_incident.machine.type if db_incident.machine else None
    machine_model = db_incident.machine.model if db_incident.machine else None
    
    # We use the provided silo_id (which should be the docsSiloId from frontend)
    knowledge_docs = await search_mattin_docs(app_id, silo_id, query_text, machine_type, machine_model, k=5)
    # Ensure only top 5 results are returned
    knowledge_docs = knowledge_docs[:5]
    
    results = []
    for doc in knowledge_docs:
        meta = doc.get("metadata", {})
        results.append({
            "content": doc.get("content", ""),
            "score": doc.get("score", 0),
            "filename": meta.get("nombre", "Documento"),
            "page": meta.get("page"),
            "total_pages": meta.get("total_pages"),
            "machine_model": meta.get("modelo"),
            "machine_id": db_incident.machine_id
        })
        
    return results

@app.post("/api/sat/incidents/{incident_id}/logs", response_model=schemas.IncidentLog)
def add_incident_log(incident_id: str, log: schemas.IncidentLogCreate, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Transition status: open -> in_progress
    if db_incident.status == "open":
        db_incident.status = "in_progress"
        db_log_status = models.IncidentLog(
            incident_id=incident_id,
            author="Sistema",
            text="Estado cambiado a: EN PROCESO"
        )
        db.add(db_log_status)

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
    }
    
    body = await request.json()
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            # Mattin expects form-urlencoded (data=...) not JSON
            response = await client.post(url, headers=headers, data=body)
            response.raise_for_status()
            return response.json()
        except httpx.ReadTimeout:
            print(f"ERROR MATTIN CHAT: Timeout waiting for response")
            raise HTTPException(status_code=504, detail="Timeout waiting for AI response")
        except httpx.HTTPStatusError as e:
            print(f"ERROR MATTIN CHAT (HTTP): {str(e)} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            print(f"ERROR MATTIN CHAT: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
