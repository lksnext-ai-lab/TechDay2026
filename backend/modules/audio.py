import os
import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/audio", tags=["audio"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "audio")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.Transcription)
async def upload_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Create a unique filename using timestamp and uuid
    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = ".webm" # Default for browser recordings
    
    unique_filename = f"{int(time.time())}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    db_transcription = models.Transcription(filename=unique_filename)
    db.add(db_transcription)
    db.commit()
    db.refresh(db_transcription)
    
    return db_transcription

@router.post("/transcribe/{transcription_id}", response_model=schemas.Transcription)
async def transcribe_audio(transcription_id: int, db: Session = Depends(get_db)):
    db_transcription = db.query(models.Transcription).filter(models.Transcription.id == transcription_id).first()
    if not db_transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # MOCK MATTIN AI RESPONSE
    # In a real scenario, we would send the file to Mattin AI here.
    # For now, we return a mock transcription and sentiment.
    
    time.sleep(1) # Simulate processing time
    
    mock_responses = [
        {"transcription": "Hola, esto es una prueba de grabación de audio para el Tech Day.", "sentiment": "neutral"},
        {"transcription": "Me encanta la nueva plataforma de Mattin AI, es súper útil.", "sentiment": "positive"},
        {"transcription": "No entiendo por qué no funciona el botón de subir archivos.", "sentiment": "negative"},
        {"transcription": "Buenos días, me gustaría solicitar información sobre los próximos eventos.", "sentiment": "neutral"}
    ]
    
    # Pick a random response or just the first one for simplicity
    import random
    mock_data = random.choice(mock_responses)
    
    db_transcription.content = mock_data["transcription"]
    db_transcription.sentiment = mock_data["sentiment"]
    
    db.commit()
    db.refresh(db_transcription)
    
    return db_transcription

@router.get("/transcriptions", response_model=List[schemas.Transcription])
def get_transcriptions(db: Session = Depends(get_db)):
    return db.query(models.Transcription).order_by(models.Transcription.created_at.desc()).all()

@router.get("/file/{filename}")
def get_audio_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.delete("/transcription/{transcription_id}")
def delete_transcription(transcription_id: int, db: Session = Depends(get_db)):
    db_transcription = db.query(models.Transcription).filter(models.Transcription.id == transcription_id).first()
    if not db_transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Get filename to delete from filesystem
    filename = db_transcription.filename
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Delete from DB first
    db.delete(db_transcription)
    db.commit()
    
    # Then try to delete from filesystem
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            # We don't raise here because the DB record is already gone
            
    return {"status": "success", "message": f"Transcription {transcription_id} deleted"}
