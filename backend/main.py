import os
import httpx
from typing import List, Optional
from fastapi import FastAPI, Request, HTTPException, Depends, UploadFile, File, Query, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import shutil
import glob
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
from modules import swarm, audio, mcp, sat

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
app.include_router(sat.router)

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

# Mattin AI Helpers moved to modules/sat.py or modules/swarm.py as needed
# SAT Module Endpoints moved to modules/sat.py
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

@app.post("/public/v1/app/{app_id}/chat/{agent_id}/call")
async def proxy_mattin_chat_call(app_id: int, agent_id: int, files: List[UploadFile] = File(None), message: Optional[str] = Form(None)):
    print(f"DEBUG: Proxying Chat Call. AppID: {app_id}, AgentID: {agent_id}")
    
    upload_files = []
    
    if files:
        for file in files:
            content = await file.read()
            upload_files.append((file.filename, content, file.content_type))
            print(f"DEBUG: Received file: {file.filename} ({file.content_type}) - Size: {len(content)} bytes")
    else:
        print("DEBUG: No files received")
        
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{agent_id}/call"
    print(f"DEBUG: Forwarding to: {url}")
    
    headers = {
        "X-API-KEY": API_KEY,
        "Accept": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            req_data = {}
            if message:
                print(f"DEBUG: Message content: {message}")
                req_data["message"] = message

            if upload_files:
                # Prepare files for httpx
                # httpx expects 'files' arg as a dictionary or list of tuples.
                # If the target API expects multiple values for 'files' key:
                # files=[('files', (filename, content, type)), ...]
                
                httpx_files = []
                for fname, fcontent, ftype in upload_files:
                    httpx_files.append(("files", (fname, fcontent, ftype)))
                
                print("DEBUG: Sending multipart request to Mattin with files...")
                response = await client.post(url, headers=headers, files=httpx_files, data=req_data)
            else:
                print("DEBUG: Sending form request to Mattin...")
                response = await client.post(url, headers=headers, data=req_data)

            print(f"DEBUG: Mattin Response Code: {response.status_code}")
            print(f"DEBUG: Mattin Response Body: {response.text[:500]}...") # Log first 500 chars

            if response.status_code != 200:
                print(f"DEBUG: Mattin Error Response: {response.text}")

            response.raise_for_status()
            return response.json()
        except httpx.ReadTimeout:
            print(f"ERROR MATTIN PROXY: Timeout waiting for response")
            raise HTTPException(status_code=504, detail="Timeout waiting for AI response")
        except httpx.HTTPStatusError as e:
            print(f"ERROR MATTIN PROXY (HTTP): {str(e)} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=f"Mattin Error: {e.response.text}")
        except Exception as e:
            print(f"ERROR MATTIN PROXY: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
