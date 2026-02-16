import os
import time
import uuid
import httpx
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import config

MATTIN_URL = config.MATTIN_URL
API_KEY = config.API_KEY

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
async def transcribe_audio(
    transcription_id: int, 
    db: Session = Depends(get_db),
    app_id: int = Query(..., description="Mattin Application ID"),
    agent_id: int = Query(..., description="Mattin Agent ID")
):
    db_transcription = db.query(models.Transcription).filter(models.Transcription.id == transcription_id).first()
    if not db_transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    # Get the file path
    file_path = os.path.join(UPLOAD_DIR, db_transcription.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    try:
        # Call Mattin AI agent endpoint with the file
        url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{agent_id}/call"
        headers = {"X-API-KEY": API_KEY}
        
        # Prepare the multipart form data
        with open(file_path, "rb") as audio_file:
            files = {"files": (db_transcription.filename, audio_file, "audio/webm")}
            data = {
                "message": "Por favor, obtén el path ABSOLUTO de este archivo de audio. Después, transcribe el audio y analiza el sentimiento (positivo, negativo o neutral). Responde SOLO con un JSON en este formato: {\"transcription\": \"texto transcrito\", \"sentiment\": \"positivo/negativo/neutral\"}"
            }
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(url, headers=headers, files=files, data=data)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Mattin AI error: {response.text}"
            )
        
        mattin_response = response.json()
        
        # Extract the agent's response
        agent_message = mattin_response.get("response", "")
        
        # Try to parse JSON from the response
        import json
        try:
            # Try to find JSON in the response
            import re
            json_match = re.search(r'\{[^}]*"transcription"[^}]*"sentiment"[^}]*\}', agent_message)
            if json_match:
                parsed_data = json.loads(json_match.group())
                db_transcription.content = parsed_data.get("transcription", agent_message)
                sentiment = parsed_data.get("sentiment", "neutral").lower()
                # Map Spanish to English if needed
                sentiment_map = {"positivo": "positive", "negativo": "negative", "neutral": "neutral"}
                db_transcription.sentiment = sentiment_map.get(sentiment, sentiment)
            else:
                # If no JSON found, use the full response as transcription
                db_transcription.content = agent_message
                db_transcription.sentiment = "neutral"
        except Exception as parse_error:
            print(f"Error parsing agent response: {parse_error}")
            # Fallback: use the raw response
            db_transcription.content = agent_message
            db_transcription.sentiment = "neutral"
        
        db.commit()
        db.refresh(db_transcription)
        
        return db_transcription
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error calling Mattin AI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing transcription: {str(e)}")

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
