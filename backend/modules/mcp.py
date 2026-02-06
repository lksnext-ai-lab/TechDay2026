
import asyncio
import json
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
import models
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp_server")

router = APIRouter(prefix="/api/mcp/sat", tags=["mcp"])

# --- TOOLS IMPLEMENTATION ---

def get_machine_types(db: Session = next(get_db())):
    """Returns a list of available machine types."""
    results = db.query(models.Machine.type).distinct().all()
    return [r[0] for r in results if r[0]]

def get_machine_models(machine_type: str, db: Session = next(get_db())):
    """Returns available models for a specific machine type."""
    results = db.query(models.Machine).filter(models.Machine.type == machine_type).all()
    return [{"id": m.id, "model": m.model, "type": m.type} for m in results]

def create_incident_tool(machine_id: str, title: str, description: str, db: Session = next(get_db())):
    """Creates a new incident in the database."""
    # Verify machine exists
    machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not machine:
        return {"error": f"Machine with ID {machine_id} not found."}

    incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
    new_incident = models.Incident(
        id=incident_id,
        machine_id=machine_id,
        title=title,
        description=description,
        status="open",
        priority="medium" # Default
    )
    
    try:
        db.add(new_incident)
        
        # Initial Log
        log = models.IncidentLog(
            incident_id=incident_id,
            author="Agente Call Center",
            text="Incidencia creada automáticamente por agente IA."
        )
        db.add(log)
        
        db.commit()
        db.refresh(new_incident)
        return {"success": True, "incident_id": incident_id, "status": "created"}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}

# --- MCP PROTOCOL ---

TOOLS = [
    {
        "name": "get_machine_types",
        "description": "Get a list of all available appliance/machine types (e.g., Lavadora, Frigorífico).",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "get_machine_models",
        "description": "Get a list of available models for a specific machine type.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "description": "The type of the machine (e.g., Lavadora)"
                }
            },
            "required": ["type"]
        }
    },
    {
        "name": "create_incident",
        "description": "Creates a new technical support incident in the system.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "machine_id": {
                    "type": "string",
                    "description": "The unique ID of the machine model (e.g., WASHER-001). Get this from get_machine_models."
                },
                "title": {
                    "type": "string",
                    "description": "Short title of the incident."
                },
                "description": {
                    "type": "string",
                    "description": "Detailed description of the problem."
                }
            },
            "required": ["machine_id", "title", "description"]
        }
    }
]

# We use a global queue for demonstration simplicity in this BFF context.
# In a real keyed environment, we'd map sessions.
# For backend-embedded MCP, we might just need to respond to the connection.
# But MCP runs over SSE (Server Sent Events) for Server->Client and HTTP POST for Client->Server.

# Store active SSE queues
connections: Dict[str, asyncio.Queue] = {}

@router.get("/sse")
async def handle_sse(request: Request):
    """
    Handles the SSE connection handshake.
    """
    session_id = str(uuid.uuid4())
    queue = asyncio.Queue()
    connections[session_id] = queue
    
    logger.info(f"New MCP Session: {session_id}")

    async def event_generator():
        try:
            # Send the endpoint event as per MCP spec
            # The client (Mattin) will POST messages to this endpoint
            # We assume the external URL is reachable, but for local dev we return a relative path or construct it.
            # Using absolute URL is safer if behind a proxy, but here we'll try to guess or use a config.
            # For now, we return the POST endpoint.
            
            # Construct the post endpoint. 
            # If running locally/ngrok, the client logic in Mattin might need the full URL.
            # We'll send the relative path for now, Mattin usually handles this relative to the SSE URL.
            endpoint_url = f"/api/mcp/sat/messages?session_id={session_id}"
            
            yield f"event: endpoint\ndata: {endpoint_url}\n\n"
            
            while True:
                # If client closes connection, this will eventually raise
                if await request.is_disconnected():
                    break
                    
                # Wait for messages to send TO the client (Mattin)
                # These are responses to tools or notifications
                message = await queue.get()
                yield f"event: message\ndata: {json.dumps(message)}\n\n"
                
        except asyncio.CancelledError:
            logger.info(f"MCP Session Cancelled: {session_id}")
        finally:
            if session_id in connections:
                del connections[session_id]

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/messages")
async def handle_messages(request: Request, session_id: str = None):
    """
    Handles incoming JSON-RPC messages from the client (Mattin).
    """
    if not session_id or session_id not in connections:
        raise HTTPException(status_code=400, detail="Invalid or missing session_id")
        
    try:
        payload = await request.json()
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # We process the message asynchronously but for simplicity we'll do it here
    # and push the RESPONSE into the SSE queue.
    
    queue = connections[session_id]
    
    jsonrpc = payload.get("jsonrpc")
    method = payload.get("method")
    params = payload.get("params", {})
    msg_id = payload.get("id")
    
    logger.info(f"MCP Message Received: {method}")

    if method == "initialize":
        # Handshake response
        response = {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "LKS SAT MCP",
                    "version": "1.0.0"
                }
            }
        }
        await queue.put(response)
        return

    if method == "notifications/initialized":
        # Nothing to reply
        return

    if method == "tools/list":
        # Return tools
        response = {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "tools": TOOLS
            }
        }
        await queue.put(response)
        return

    if method == "tools/call":
        tool_name = params.get("name")
        tool_args = params.get("arguments", {})
        
        result = None
        is_error = False
        
        try:
            # We need a new DB session for this tool call
            db = next(get_db())
            
            if tool_name == "get_machine_types":
                result = get_machine_types(db)
            elif tool_name == "get_machine_models":
                type_arg = tool_args.get("type")
                result = get_machine_models(type_arg, db)
            elif tool_name == "create_incident":
                m_id = tool_args.get("machine_id")
                title = tool_args.get("title")
                desc = tool_args.get("description")
                result = create_incident_tool(m_id, title, desc, db)
            else:
                is_error = True
                result = f"Unknown tool: {tool_name}"
                
        except Exception as e:
            is_error = True
            result = str(e)
            
        response = {
            "jsonrpc": "2.0",
            "id": msg_id,
        }
        
        if is_error:
            response["error"] = {
                "code": -32603,
                "message": str(result)
            }
        else:
            response["result"] = {
                "content": [{
                    "type": "text",
                    "text": json.dumps(result)
                }]
            }
            
        await queue.put(response)
        return

    # Fallback for unknown methods
    # Not pushing error to preserve connection stability unless critical
    return "OK"
