import httpx
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Request
import config

router = APIRouter(prefix="/api/swarm", tags=["swarm"])

MATTIN_URL = config.MATTIN_URL
API_KEY = config.API_KEY

@router.post("/process_turn")
async def process_turn(request: Request):
    """
    Processes a single turn in the swarm session.
    Expects:
    {
        "appId": int,
        "agent": { "id": str, "name": str, "agentId": int },
        "history": [ { "sender": str, "text": str, "agentId": int? } ],
        "userPrompt": str (optional, only for the first turn or if user intervenes)
    }
    """
    data = await request.json()
    app_id = data.get("appId")
    agent = data.get("agent")
    history = data.get("history", [])
    user_prompt = data.get("userPrompt", "")

    if not app_id or not agent or not agent.get("agentId"):
        raise HTTPException(status_code=400, detail="Missing appId or agent configuration")

    # Calculate delta context: messages since this agent last participated
    delta_context = []
    found_last_participation = False
    
    # Iterate backwards to find last participation
    for msg in reversed(history):
        if msg.get("agentId") == agent.get("agentId"):
            found_last_participation = True
            break
        delta_context.insert(0, f"{msg['sender']}: {msg['text']}")

    # If never participated, the whole history is context (except maybe the system intro)
    if not found_last_participation:
        delta_context = [f"{msg['sender']}: {msg['text']}" for msg in history]

    # Construct the message for Mattin
    context_str = "\n".join(delta_context)
    
    # We prefix the prompt with the context if history exists
    if context_str:
        final_prompt = f"[CONCURSO/CONTEXTO DE LA SESIÓN RECIENTE]:\n{context_str}\n\n[TU TURNO]: {user_prompt if user_prompt else 'Continúa el debate aportando desde tu perspectiva.'}"
    else:
        final_prompt = user_prompt if user_prompt else "Inicia el debate sobre el tema proporcionado."

    # Call Mattin API
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{agent['agentId']}/call"
    headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            print(f"DEBUG: process_turn calling agent {agent['agentId']} at {url}")
            response = await client.post(url, headers=headers, json={"message": final_prompt})
            response.raise_for_status()
            res_data = response.json()
            
            return {
                "agentId": agent["agentId"],
                "name": agent["name"],
                "response": res_data.get("response", ""),
                "deltaContextUsed": context_str
            }
        except httpx.HTTPStatusError as e:
            print(f"DEBUG: process_turn HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            print(f"DEBUG: process_turn General Error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/decide_next")
async def decide_next(request: Request):
    """
    Calls the Moderator agent to decide who speaks next.
    Expects:
    {
        "appId": int,
        "moderatorAgentId": int,
        "history": [ { "sender": str, "text": str } ],
        "availableAgents": [ { "id": str, "name": str, "description": str } ]
    }
    """
    data = await request.json()
    app_id = data.get("appId")
    mod_id = data.get("moderatorAgentId")
    history = data.get("history", [])
    available = data.get("availableAgents", [])

    if not app_id or not mod_id:
        raise HTTPException(status_code=400, detail="Missing appId or moderatorAgentId")

    # Construct the moderator prompt
    history_str = "\n".join([f"{m['sender']}: {m['text']}" for m in history])
    agents_str = "\n".join([f"- {a['id']}: {a['name']} ({a['description']})" for a in available])
    
    prompt = (
        f"[HISTORIAL DE LA CONVERSACIÓN]:\n{history_str}\n\n"
        f"[EXPERTOS DISPONIBLES]:\n{agents_str}\n\n"
        f"Basado en el contexto, ¿quién debería hablar ahora? Responde SOLO con el JSON: {{\"next\": \"id_del_agente\"}} o {{\"next\": \"fin\"}}."
    )

    url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{mod_id}/call"
    headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }

    print(f"DEBUG: Calling Moderator at {url}")
    print(f"DEBUG: Prompt length: {len(prompt)}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, headers=headers, json={"message": prompt})
            response.raise_for_status()
            res_data = response.json()
            
            # Extract data from response
            raw_res = res_data.get("response", "")
            print(f"DEBUG: Moderator Raw Response Type: {type(raw_res)}")
            print(f"DEBUG: Moderator Raw Response Content: {raw_res}")

            # If it's already a dict, we are good
            if isinstance(raw_res, dict):
                return raw_res
            
            # If it's a string, we need to clean and parse it
            if isinstance(raw_res, str):
                raw_res = raw_res.strip()
                if "```json" in raw_res:
                    raw_res = raw_res.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_res:
                    raw_res = raw_res.split("```")[1].strip()
                
                # Basic cleanup if AI added trailing commas or text
                import json
                try:
                    decision = json.loads(raw_res)
                    return decision
                except Exception as json_err:
                    print(f"DEBUG: JSON Parse Error: {json_err} for raw text: {raw_res}")
                    # Fallback: try to find anything that looks like {"next": "..."}
                    import re
                    match = re.search(r'\{\s*"next"\s*:\s*"([^"]+)"\s*\}', raw_res)
                    if match:
                        return {"next": match.group(1)}
                    raise HTTPException(status_code=500, detail=f"Moderator returned invalid string JSON: {raw_res}")
            
            raise HTTPException(status_code=500, detail=f"Unexpected response type from Moderator: {type(raw_res)}")

        except httpx.HTTPStatusError as e:
            print(f"DEBUG: HTTP Status Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            print(f"DEBUG: General Error in decide_next: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset_session")
async def reset_session(request: Request):
    """
    Resets the conversation for all specified agents.
    """
    data = await request.json()
    app_id = data.get("appId")
    agents = data.get("agents", [])

    if not app_id or not agents:
        raise HTTPException(status_code=400, detail="Missing appId or agents list")

    headers = {"X-API-KEY": API_KEY}
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        results = []
        for agent in agents:
            if not agent.get("agentId"): continue
            
            url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{agent['agentId']}/reset"
            try:
                resp = await client.post(url, headers=headers)
                results.append({"agentId": agent['agentId'], "status": resp.status_code})
            except Exception as e:
                print(f"DEBUG: reset_session error for agent {agent['agentId']}: {str(e)}")
                results.append({"agentId": agent['agentId'], "error": str(e)})
        
        return {"results": results}
