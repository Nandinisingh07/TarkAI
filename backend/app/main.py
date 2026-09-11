import uuid
import threading
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, BackgroundTasks, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.config.settings import settings
from app.network_monitor import network_monitor
from app.router import TaskRouter
from app.agent import ReActAgent
from app.output_generator import generate_deliverable

app = FastAPI(
    title="Sovereign On-Premise Agentic AI Workbench",
    description="Air-gapped confidential industrial AI assistant API (SIH PS26117)",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite port 5173 / 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active tasks state store
tasks_db = {}
tasks_lock = threading.Lock()

# Start background network monitor on startup
@app.on_event("startup")
def startup_event():
    network_monitor.start_monitoring(interval_seconds=3)

# Data Models
class TaskRequest(BaseModel):
    task_description: str
    files: Optional[List[str]] = []

def run_agent_background(task_id: str, task_description: str, files: List[str]):
    agent = ReActAgent(task_id=task_id, task_description=task_description, attached_files=files)
    
    with tasks_lock:
        tasks_db[task_id]["agent"] = agent
        tasks_db[task_id]["model_used"] = agent.model
        tasks_db[task_id]["routing_reason"] = agent.routing_reason

    # Run ReAct Loop
    result = agent.run()

    # Deliverable Generation if requested in final_answer
    deliverable = None
    final_ans = result.get("final_answer", {})
    if isinstance(final_ans, dict):
        fmt = final_ans.get("output_format", "text")
        content = final_ans.get("content", "")
        if fmt in ["docx", "pptx", "xlsx"]:
            deliverable = generate_deliverable(task_id, fmt, content)

    with tasks_lock:
        tasks_db[task_id]["status"] = "completed"
        tasks_db[task_id]["result"] = result
        tasks_db[task_id]["deliverable"] = deliverable

@app.post("/api/task")
def create_task(req: TaskRequest, background_tasks: BackgroundTasks):
    if not req.task_description.strip():
        raise HTTPException(status_code=400, detail="Task description cannot be empty.")

    task_id = uuid.uuid4().hex
    
    # Classify model up front for immediate feedback
    classification = TaskRouter.classify_task(req.task_description)

    with tasks_lock:
        tasks_db[task_id] = {
            "task_id": task_id,
            "status": "running",
            "task_description": req.task_description,
            "files": req.files or [],
            "model_used": classification["model"],
            "routing_reason": classification["reason"],
            "agent": None,
            "result": None,
            "deliverable": None
        }

    background_tasks.add_task(run_agent_background, task_id, req.task_description, req.files or [])

    return {
        "task_id": task_id,
        "status": "running",
        "model_used": classification["model"],
        "routing_reason": classification["reason"]
    }

@app.get("/api/task/{task_id}/status")
def get_task_status(task_id: str):
    with tasks_lock:
        task_data = tasks_db.get(task_id)

    if not task_data:
        raise HTTPException(status_code=404, detail=f"Task ID {task_id} not found.")

    agent: ReActAgent = task_data.get("agent")
    trace = agent.trace if agent else []
    current_step = agent.current_step if agent else 0

    return {
        "task_id": task_id,
        "status": task_data["status"],
        "model_used": task_data["model_used"],
        "routing_reason": task_data["routing_reason"],
        "current_step": current_step,
        "trace": trace
    }

@app.get("/api/task/{task_id}/result")
def get_task_result(task_id: str):
    with tasks_lock:
        task_data = tasks_db.get(task_id)

    if not task_data:
        raise HTTPException(status_code=404, detail=f"Task ID {task_id} not found.")

    if task_data["status"] == "running":
        return {
            "task_id": task_id,
            "status": "running",
            "message": "Task execution is still in progress."
        }

    return {
        "task_id": task_id,
        "status": task_data["status"],
        "model_used": task_data["model_used"],
        "result": task_data.get("result"),
        "deliverable": task_data.get("deliverable")
    }

@app.get("/monitor/status")
def get_airgap_status():
    return network_monitor.get_status()

@app.post("/api/upload")
def upload_file(file: UploadFile = File(...)):
    uploads_dir = settings.UPLOADS_DIR
    target_path = uploads_dir / file.filename
    
    try:
        with open(target_path, "wb") as buffer:
            buffer.write(file.file.read())
        return {
            "filename": file.filename,
            "status": "uploaded",
            "saved_path": str(target_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.get("/outputs/{filename}")
def download_deliverable(filename: str):
    outputs_dir = settings.OUTPUTS_DIR
    target = (outputs_dir / filename).resolve()
    
    if not target.exists() or not str(target).startswith(str(outputs_dir.resolve())):
        raise HTTPException(status_code=404, detail="Requested deliverable file not found.")
    
    return FileResponse(path=str(target), filename=filename)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "air_gapped": True,
        "models": {
            "coder": settings.CODER_MODEL,
            "general": settings.GENERAL_MODEL,
            "vision": settings.VISION_MODEL
        }
    }
