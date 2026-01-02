import os
import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

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
