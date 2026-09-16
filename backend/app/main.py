from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.config.settings import settings
from app.config.model_registry import model_registry
from app.network_monitor import network_monitor
from app.task_queue import task_queue
from app.approval_gate import approval_gate
from app.confidence_logger import confidence_logger
from app.audit_logger import audit_logger
from app.auth import get_current_user, require_roles, UserContext

app = FastAPI(
    title="Sovereign On-Premise Agentic AI Workbench",
    description="Air-gapped confidential industrial AI assistant API (SIH PS26117)",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite port 5173 / 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start background network monitor on startup
@app.on_event("startup")
def startup_event():
    network_monitor.start_monitoring(interval_seconds=3)
    audit_logger.log_event(
        action="SYSTEM_STARTUP",
        resource="TarkAI Server",
        status="ONLINE",
        details={"profile": model_registry.PROFILE_NAME}
    )

# Request Pydantic Schemas
class TaskRequest(BaseModel):
    task_description: str
    files: Optional[List[str]] = []

class ReviewDecisionRequest(BaseModel):
    status: str # "approved" or "rejected"
    comment: Optional[str] = ""

from app.model_router import model_router

# Feature 1: Model Registry & Task Model Router APIs
@app.get("/api/model-registry")
def get_model_registry(user: UserContext = Depends(get_current_user)):
    return model_registry.get_summary()

class RoutePreviewRequest(BaseModel):
    task_description: str

@app.post("/api/route-preview")
def preview_task_routing(req: RoutePreviewRequest, user: UserContext = Depends(get_current_user)):
    if not req.task_description.strip():
        raise HTTPException(status_code=400, detail="Task description cannot be empty.")
    decision = model_router.classify_and_route(req.task_description, log_audit=True)
    return decision

from app.agent.code_verifier import verify_code_execution

class CodeVerifyRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    expected_output_contains: Optional[str] = None
    test_cases: Optional[List[Dict[str, Any]]] = None

@app.post("/api/code/verify")
def verify_code(req: CodeVerifyRequest, user: UserContext = Depends(require_roles(["engineer", "admin"]))):
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code string cannot be empty.")
    res = verify_code_execution(
        code=req.code,
        language=req.language or "python",
        expected_output_contains=req.expected_output_contains,
        test_cases=req.test_cases,
        job_id="manual_verification"
    )
    return res



# Feature 6: In-Process Task Queue API
@app.post("/api/task")
def create_task(req: TaskRequest, user: UserContext = Depends(require_roles(["engineer", "admin"]))):
    if not req.task_description.strip():
        raise HTTPException(status_code=400, detail="Task description cannot be empty.")

    job_info = task_queue.submit_job(req.task_description, req.files or [])
    return job_info

@app.get("/api/task/{task_id}/status")
def get_task_status(task_id: str, user: UserContext = Depends(get_current_user)):
    status_info = task_queue.get_job_status(task_id)
    if not status_info:
        raise HTTPException(status_code=404, detail=f"Task ID {task_id} not found in task queue.")
    return status_info

@app.get("/api/task/{task_id}/result")
def get_task_result(task_id: str, user: UserContext = Depends(get_current_user)):
    result_info = task_queue.get_job_result(task_id)
    if not result_info:
        raise HTTPException(status_code=404, detail=f"Task ID {task_id} not found.")
    return result_info

# Feature 2: Human Approval Gate APIs
@app.get("/api/reviews")
def list_review_drafts(status: Optional[str] = None, user: UserContext = Depends(get_current_user)):
    return approval_gate.list_drafts(status_filter=status)

@app.get("/api/reviews/{review_id}")
def get_review_draft(review_id: str, user: UserContext = Depends(get_current_user)):
    draft = approval_gate.get_draft(review_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Review draft {review_id} not found.")
    return draft

@app.post("/api/reviews/{review_id}/approve")
def approve_draft(review_id: str, req: Optional[ReviewDecisionRequest] = None, user: UserContext = Depends(require_roles(["admin"]))):
    comment = req.comment if req else ""
    updated = approval_gate.update_status(review_id, new_status="approved", reviewer_role=user.role, comment=comment)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Review draft {review_id} not found.")
    return updated

@app.post("/api/reviews/{review_id}/reject")
def reject_draft(review_id: str, req: Optional[ReviewDecisionRequest] = None, user: UserContext = Depends(require_roles(["admin"]))):
    comment = req.comment if req else ""
    updated = approval_gate.update_status(review_id, new_status="rejected", reviewer_role=user.role, comment=comment)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Review draft {review_id} not found.")
    return updated

# Feature 3: Confidence & Logging APIs
@app.get("/api/confidence/stats")
def get_confidence_stats(user: UserContext = Depends(get_current_user)):
    return confidence_logger.get_stats()

@app.get("/api/confidence/logs")
def get_confidence_logs(limit: int = 50, user: UserContext = Depends(get_current_user)):
    return confidence_logger.get_recent_logs(limit=limit)

# Feature 5: Audit Log APIs
@app.get("/api/audit/logs")
def get_audit_logs(limit: int = 50, user: UserContext = Depends(get_current_user)):
    return audit_logger.get_logs(limit=limit)

# Existing Utility & Monitoring Endpoints
@app.get("/monitor/status")
def get_airgap_status():
    return network_monitor.get_status()

@app.post("/api/upload")
def upload_file(file: UploadFile = File(...), user: UserContext = Depends(require_roles(["engineer", "admin"]))):
    uploads_dir = settings.UPLOADS_DIR
    target_path = uploads_dir / file.filename
    
    try:
        with open(target_path, "wb") as buffer:
            buffer.write(file.file.read())

        audit_logger.log_event(
            action="FILE_ACCESSED",
            resource=file.filename,
            user_role=user.role,
            status="UPLOADED",
            details={"saved_path": str(target_path)}
        )

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

    audit_logger.log_event(
        action="FILE_ACCESSED",
        resource=filename,
        status="DOWNLOADED",
        details={"path": str(target)}
    )
    
    return FileResponse(path=str(target), filename=filename)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "air_gapped": True,
        "profile": model_registry.PROFILE_NAME,
        "models": {
            "general": settings.GENERAL_MODEL,
            "coder": settings.CODER_MODEL,
            "vision": settings.VISION_MODEL,
            "ocr_engine": settings.OCR_ENGINE,
            "object_detection": settings.OBJECT_DETECTION_MODEL
        }
    }

from pathlib import Path
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="static_assets")
    
    @app.get("/")
    def serve_ui():
        return FileResponse(str(frontend_dist / "index.html"))

