import os
import json
import re
import httpx
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/api/swarm", tags=["swarm"])

MATTIN_URL = os.getenv("MATTIN_URL", "https://aict-desa.lksnext.com")
API_KEY = os.getenv("API_KEY")


# ─── Helper: call a Mattin agent ───
async def _call_mattin_agent(client: httpx.AsyncClient, app_id: int, agent_id: int, message: str) -> str:
    """Call a Mattin agent and return the raw response text."""
    url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{agent_id}/call"
    headers = {"X-API-KEY": API_KEY}
    print(f"DEBUG: _call_mattin_agent agent {agent_id} at {url}")
    response = await client.post(url, headers=headers, data={"message": message})
    response.raise_for_status()
    res_data = response.json()
    return res_data.get("response", "")


# ─── Helper: parse moderator JSON decision ───
def _parse_moderator_decision(raw_res) -> dict:
    """Parse moderator response into a dict with 'next' key."""
    if isinstance(raw_res, dict):
        return raw_res

    if isinstance(raw_res, str):
        raw_res = raw_res.strip()
        if "```json" in raw_res:
            raw_res = raw_res.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_res:
            raw_res = raw_res.split("```")[1].strip()

        try:
            return json.loads(raw_res)
        except Exception:
            match = re.search(r'\{\s*"next"\s*:\s*"([^"]+)"\s*\}', raw_res)
            if match:
                return {"next": match.group(1)}
            raise HTTPException(status_code=500, detail=f"Moderator returned invalid JSON: {raw_res}")

    raise HTTPException(status_code=500, detail=f"Unexpected moderator response type: {type(raw_res)}")


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
        final_prompt = (
            f"[CONCURSO/CONTEXTO DE LA SESIÓN RECIENTE]:\n{context_str}\n\n"
            f"[TU TURNO]: {user_prompt if user_prompt else 'Continúa el debate aportando desde tu perspectiva.'}\n\n"
            f"IMPORTANTE: Sé conciso. Máximo 150 palabras. No repitas ideas ya planteadas."
        )
    else:
        final_prompt = (
            f"{user_prompt if user_prompt else 'Inicia el debate sobre el tema proporcionado.'}\n\n"
            f"IMPORTANTE: Sé conciso. Máximo 150 palabras."
        )

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response_text = await _call_mattin_agent(client, app_id, agent["agentId"], final_prompt)
            return {
                "agentId": agent["agentId"],
                "name": agent["name"],
                "response": response_text,
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
        "availableAgents": [ { "id": str, "name": str, "description": str } ],
        "mode": "single" | "discussion" (optional, defaults to "single")
    }
    In 'single' mode: moderator can return {"next":"id"}, {"next":"you"}, or {"next":"fin"}.
    In 'discussion' mode: moderator can return {"next":"id"} or {"next":"fin"} (no user turn).
    """
    data = await request.json()
    app_id = data.get("appId")
    mod_id = data.get("moderatorAgentId")
    history = data.get("history", [])
    available = data.get("availableAgents", [])
    mode = data.get("mode", "single")
    turn_count = data.get("turnCount", 0)

    if not app_id or not mod_id:
        raise HTTPException(status_code=400, detail="Missing appId or moderatorAgentId")

    # Construct the moderator prompt
    history_str = "\n".join([f"{m['sender']}: {m['text']}" for m in history])
    agents_str = "\n".join([f"- {a['id']}: {a['name']} ({a['description']})" for a in available])

    # Track participation: count how many times each agent has spoken
    agent_speak_count = {a["id"]: 0 for a in available}
    for m in history:
        for a in available:
            if m.get("sender", "").lower() == a.get("name", "").lower():
                agent_speak_count[a["id"]] += 1

    not_participated = [aid for aid, count in agent_speak_count.items() if count == 0]
    spoke_once = [aid for aid, count in agent_speak_count.items() if count == 1]
    spoke_twice = [aid for aid, count in agent_speak_count.items() if count >= 2]
    all_spoke_at_least_once = len(not_participated) == 0
    round_complete = all_spoke_at_least_once and len(spoke_twice) >= len(available) // 2

    # Build participation status string
    participation_lines = []
    for a in available:
        count = agent_speak_count[a["id"]]
        participation_lines.append(f"  - {a['id']} ({a['name']}): {count} intervención(es)")
    participation_info = "\n".join(participation_lines)

    if mode == "discussion":
        # Determine debate phase
        if not all_spoke_at_least_once:
            phase_instruction = (
                f"FASE ACTUAL: Primera ronda. Hay expertos que aún no han hablado ({', '.join(not_participated)}). "
                f"Debes darles turno. NO puedes indicar \"fin\" todavía."
            )
        elif not round_complete:
            phase_instruction = (
                f"FASE ACTUAL: Segunda ronda. Todos han hablado al menos una vez, pero el debate necesita profundidad. "
                f"Elige a un experto que debería responder a los argumentos de otro o complementar su primera intervención. "
                f"Puedes indicar \"fin\" solo si realmente no hay nada nuevo que aportar."
            )
        else:
            phase_instruction = (
                f"FASE ACTUAL: El debate ya tiene suficiente profundidad. "
                f"Puedes indicar \"fin\" si los puntos de vista están cubiertos, "
                f"o dar un turno adicional si ves un ángulo no explorado."
            )

        prompt = (
            f"[HISTORIAL DEL DEBATE ENTRE EXPERTOS]:\n{history_str}\n\n"
            f"[EXPERTOS DISPONIBLES]:\n{agents_str}\n\n"
            f"[ESTADO DEL DEBATE]:\n"
            f"Turno actual: {turn_count + 1} de un máximo de 10.\n"
            f"Intervenciones por experto:\n{participation_info}\n\n"
            f"{phase_instruction}\n\n"
            f"Responde SOLO con el JSON: {{\"next\": \"id_del_agente\"}} o {{\"next\": \"fin\"}}."
        )
    else:
        prompt = (
            f"[HISTORIAL DE LA CONVERSACIÓN]:\n{history_str}\n\n"
            f"[EXPERTOS DISPONIBLES]:\n{agents_str}\n\n"
            f"Basado en el contexto, ¿quién debería hablar ahora? Responde SOLO con el JSON: {{\"next\": \"id_del_agente\"}} o {{\"next\": \"fin\"}}."
        )

    url = f"{MATTIN_URL}/public/v1/app/{app_id}/chat/{mod_id}/call"
    headers = {"X-API-KEY": API_KEY}

    print(f"DEBUG: Calling Moderator at {url} (mode={mode})")
    print(f"DEBUG: Prompt length: {len(prompt)}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, headers=headers, data={"message": prompt})
            response.raise_for_status()
            res_data = response.json()
            
            raw_res = res_data.get("response", "")
            print(f"DEBUG: Moderator Raw Response: {raw_res}")

            decision = _parse_moderator_decision(raw_res)

            # In discussion mode, convert "you" to a valid agent pick (skip user turn)
            if mode == "discussion" and decision.get("next") == "you":
                # If moderator tries to hand off to user in discussion mode,
                # just pick the first available agent that hasn't spoken recently
                if available:
                    decision = {"next": available[0]["id"]}
                else:
                    decision = {"next": "fin"}

            return decision

        except httpx.HTTPStatusError as e:
            print(f"DEBUG: HTTP Status Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            print(f"DEBUG: General Error in decide_next: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/discussion_summarize")
async def discussion_summarize(request: Request):
    """
    Asks the Moderator to produce a final summary of the multi-agent discussion.
    Expects:
    {
        "appId": int,
        "moderatorAgentId": int,
        "history": [ { "sender": str, "text": str } ],
        "userPrompt": str
    }
    Returns: { "summary": str }
    """
    data = await request.json()
    app_id = data.get("appId")
    mod_id = data.get("moderatorAgentId")
    history = data.get("history", [])
    user_prompt = data.get("userPrompt", "")

    if not app_id or not mod_id:
        raise HTTPException(status_code=400, detail="Missing appId or moderatorAgentId")

    history_str = "\n".join([f"{m['sender']}: {m['text']}" for m in history])

    prompt = (
        f"[PREGUNTA]: {user_prompt}\n\n"
        f"[DEBATE]:\n{history_str}\n\n"
        f"Genera una síntesis ejecutiva completa y profesional (300-320 palabras).\n\n"
        f"ESTRUCTURA OBLIGATORIA:\n"
        f"### Respuesta\n"
        f"[Un párrafo cohesivo de 50-60 palabras que responda la pregunta del usuario. Incluye:\n"
        f"- Respuesta directa en 1-2 frases\n"
        f"- Los 3-4 pilares/consideraciones críticas identificados en el debate\n"
        f"- Síntesis del consenso alcanzado]\n\n"
        f"### Aportes por Experto\n"
        f"| Experto | Contribución Clave |\n"
        f"|---------|-------------------|\n"
        f"| [Nombre] | [35-40 palabras describiendo su aporte específico con detalles concretos] |\n\n"
        f"### Siguiente Paso\n"
        f"[50-60 palabras estructuradas en fases/semanas concretas. Incluye:\n"
        f"- Fase 1 con timeline específico\n"
        f"- Fase 2 con acciones y métricas\n"
        f"- Lenguaje accionable y ejecutivo]\n\n"
        f"INSTRUCCIONES CRÍTICAS:\n"
        f"- Total: 300-320 palabras (no comprimas, da detalles)\n"
        f"- Cada contribución: 35-40 palabras con especificidad (números, tecnologías, procesos)\n"
        f"- Siguiente Paso: dividido en fases con semanas/días específicos\n"
        f"- Lenguaje profesional y ejecutivo, sin rodeos pero con sustancia\n"
        f"- Incluye TODOS los expertos que participaron en la tabla"
    )

    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            response_text = await _call_mattin_agent(client, app_id, mod_id, prompt)
            return {"summary": response_text}
        except httpx.HTTPStatusError as e:
            print(f"DEBUG: discussion_summarize HTTP Error: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            print(f"DEBUG: discussion_summarize General Error: {str(e)}")
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
