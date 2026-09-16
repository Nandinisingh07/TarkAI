import time
import uuid
import queue
import threading
from datetime import datetime
from typing import Dict, Any, List, Optional

from app.agent import ReActAgent
from app.output_generator import generate_deliverable
from app.approval_gate import approval_gate
from app.audit_logger import audit_logger

class TaskQueueWorker:
    """
    In-process Task Queue manager for TarkAI agent / document / diagram pipeline.
    Task states: queued -> running -> completed/failed.
    Tracks precise job ID timings and deliverable throughput.
    """
    def __init__(self):
        self.work_queue = queue.Queue()
        self.tasks_db: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()
        self.worker_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.worker_thread.start()

    def submit_job(self, task_description: str, files: List[str] = None) -> Dict[str, Any]:
        job_id = uuid.uuid4().hex
        created_at = datetime.utcnow().isoformat() + "Z"

        from app.router import TaskRouter
        classification = TaskRouter.classify_task(task_description)

        job_record = {
            "task_id": job_id,
            "status": "queued",
            "task_description": task_description,
            "files": files or [],
            "model_used": classification["model"],
            "routing_reason": classification["reason"],
            "created_at": created_at,
            "started_at": None,
            "completed_at": None,
            "timings": {
                "total_duration_seconds": 0.0,
                "agent_reasoning_seconds": 0.0,
                "deliverable_generation_seconds": 0.0,
            },
            "agent": None,
            "result": None,
            "deliverable": None,
            "review_id": None
        }

        with self.lock:
            self.tasks_db[job_id] = job_record

        # Audit log job query submission
        audit_logger.log_event(
            action="QUERY_SUBMITTED",
            resource=f"Job {job_id[:8]}",
            status="QUEUED",
            details={"task_description": task_description, "model": classification["model"]}
        )

        self.work_queue.put(job_id)

        return {
            "task_id": job_id,
            "status": "queued",
            "model_used": classification["model"],
            "routing_reason": classification["reason"]
        }

    def _process_queue(self):
        while True:
            try:
                job_id = self.work_queue.get()
                if not job_id:
                    continue

                self._run_job(job_id)
                self.work_queue.task_done()
            except Exception as e:
                print(f"Queue worker exception: {e}")

    def _run_job(self, job_id: str):
        from app.agent.orchestrator import AgentOrchestrator
        from app.output_generator import generate_deliverable
        from app.approval_gate import approval_gate
        from app.audit_logger import audit_logger
        with self.lock:
            job_data = self.tasks_db.get(job_id)
            if not job_data:
                return
            job_data["status"] = "running"
            job_data["started_at"] = datetime.utcnow().isoformat() + "Z"

        start_time = time.time()
        task_desc = job_data["task_description"]
        files = job_data["files"]

        # Run ReAct Orchestrator Agent Loop
        agent_start = time.time()
        orchestrator = AgentOrchestrator(task_id=job_id, task_description=task_desc, attached_files=files)
        
        with self.lock:
            job_data["agent"] = orchestrator
            job_data["model_used"] = orchestrator.model
            job_data["routing_reason"] = orchestrator.routing_reason

        result = orchestrator.run_loop()
        agent_duration = round(time.time() - agent_start, 4)


        # Deliverable generation
        gen_start = time.time()
        deliverable = None
        final_ans = result.get("final_answer", {})
        fmt = "text"
        content = ""
        if isinstance(final_ans, dict):
            fmt = final_ans.get("output_format", "text")
            content = final_ans.get("content", "")
            if fmt in ["docx", "pptx", "xlsx"]:
                deliverable = generate_deliverable(job_id, fmt, content)
        gen_duration = round(time.time() - gen_start, 4)

        total_duration = round(time.time() - start_time, 4)

        # Create Human Approval Gate Draft entry for all generated deliverables/reports/code
        draft = approval_gate.create_draft(
            job_id=job_id,
            title=f"Deliverable for: {task_desc[:50]}...",
            deliverable_type=fmt if fmt in ["docx", "pptx", "xlsx"] else "report",
            content=content or str(final_ans),
            reasoning_trace=agent.trace,
            mandatory_review=False # Will be set to True if low confidence occurred during tools
        )

        with self.lock:
            job_data["status"] = "completed"
            job_data["completed_at"] = datetime.utcnow().isoformat() + "Z"
            job_data["result"] = result
            job_data["deliverable"] = deliverable
            job_data["review_id"] = draft["review_id"]
            job_data["timings"] = {
                "total_duration_seconds": total_duration,
                "agent_reasoning_seconds": agent_duration,
                "deliverable_generation_seconds": gen_duration,
            }

        # Audit log document generated
        audit_logger.log_event(
            action="DOCUMENT_GENERATED",
            resource=f"Job {job_id[:8]} ({fmt})",
            status="COMPLETED",
            details={
                "task_id": job_id,
                "format": fmt,
                "total_duration_seconds": total_duration,
                "review_id": draft["review_id"]
            }
        )

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            job_data = self.tasks_db.get(job_id)
            if not job_data:
                return None
            
            agent = job_data.get("agent")
            trace = agent.trace if agent else []
            current_step = agent.current_step if agent else 0

            return {
                "task_id": job_id,
                "status": job_data["status"],
                "model_used": job_data["model_used"],
                "routing_reason": job_data["routing_reason"],
                "created_at": job_data["created_at"],
                "started_at": job_data["started_at"],
                "completed_at": job_data["completed_at"],
                "timings": job_data["timings"],
                "current_step": current_step,
                "trace": trace,
                "review_id": job_data.get("review_id")
            }

    def get_job_result(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            job_data = self.tasks_db.get(job_id)
            if not job_data:
                return None

            if job_data["status"] in ["queued", "running"]:
                return {
                    "task_id": job_id,
                    "status": job_data["status"],
                    "message": f"Task is currently {job_data['status']} in process queue."
                }

            return {
                "task_id": job_id,
                "status": job_data["status"],
                "model_used": job_data["model_used"],
                "result": job_data.get("result"),
                "deliverable": job_data.get("deliverable"),
                "timings": job_data.get("timings"),
                "review_id": job_data.get("review_id")
            }

task_queue = TaskQueueWorker()
