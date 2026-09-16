import json
import uuid
import sqlite3
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = DATA_DIR / "reviews.db"

class ApprovalGate:
    """
    Human Approval Gate manager for generated deliverables (reports, docs, PPTs, spreadsheets, code).
    State machine: draft -> pending_review -> approved/rejected.
    Manages mandatory review flags triggered by low-confidence OCR/vision calls.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS review_drafts (
                    review_id TEXT PRIMARY KEY,
                    job_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    deliverable_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    reasoning_trace TEXT NOT NULL,
                    status TEXT NOT NULL,
                    mandatory_review BOOLEAN NOT NULL,
                    created_at TEXT NOT NULL,
                    reviewed_at TEXT,
                    reviewer_role TEXT,
                    review_comment TEXT
                )
            """)
            conn.commit()
            conn.close()

    def create_draft(self, job_id: str, title: str, deliverable_type: str, content: Any, reasoning_trace: List[Dict[str, Any]], mandatory_review: bool = False) -> Dict[str, Any]:
        review_id = uuid.uuid4().hex
        created_at = datetime.utcnow().isoformat() + "Z"
        content_str = json.dumps(content) if isinstance(content, (dict, list)) else str(content)
        trace_str = json.dumps(reasoning_trace)
        status = "pending_review"

        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO review_drafts (review_id, job_id, title, deliverable_type, content, reasoning_trace, status, mandatory_review, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (review_id, job_id, title, deliverable_type, content_str, trace_str, status, bool(mandatory_review), created_at))
            conn.commit()
            conn.close()

        # Audit log creation
        from app.audit_logger import audit_logger
        audit_logger.log_event(
            action="DOCUMENT_DRAFT_CREATED",
            resource=f"Draft {review_id} ({deliverable_type})",
            status="PENDING_REVIEW",
            details={"job_id": job_id, "mandatory_review": mandatory_review, "title": title}
        )

        return self.get_draft(review_id)

    def set_mandatory_review(self, job_id: str):
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("UPDATE review_drafts SET mandatory_review = 1 WHERE job_id = ?", (job_id,))
            conn.commit()
            conn.close()

    def update_status(self, review_id: str, new_status: str, reviewer_role: str = "admin", comment: str = "") -> Optional[Dict[str, Any]]:
        if new_status not in ["approved", "rejected"]:
            raise ValueError(f"Invalid approval status '{new_status}'. Allowed: approved, rejected")

        reviewed_at = datetime.utcnow().isoformat() + "Z"

        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE review_drafts 
                SET status = ?, reviewed_at = ?, reviewer_role = ?, review_comment = ?
                WHERE review_id = ?
            """, (new_status, reviewed_at, reviewer_role, comment, review_id))
            conn.commit()
            conn.close()

        # Audit log decision
        from app.audit_logger import audit_logger
        audit_logger.log_event(
            action=f"DOCUMENT_{new_status.upper()}",
            resource=f"Draft {review_id}",
            user_role=reviewer_role,
            status=new_status.upper(),
            details={"review_id": review_id, "comment": comment}
        )

        return self.get_draft(review_id)

    def get_draft(self, review_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM review_drafts WHERE review_id = ?", (review_id,))
            r = cursor.fetchone()
            conn.close()

        if not r:
            return None

        content = r["content"]
        try:
            content = json.loads(content)
        except Exception:
            pass

        trace = []
        try:
            trace = json.loads(r["reasoning_trace"])
        except Exception:
            pass

        return {
            "review_id": r["review_id"],
            "job_id": r["job_id"],
            "title": r["title"],
            "deliverable_type": r["deliverable_type"],
            "content": content,
            "reasoning_trace": trace,
            "status": r["status"],
            "mandatory_review": bool(r["mandatory_review"]),
            "created_at": r["created_at"],
            "reviewed_at": r["reviewed_at"],
            "reviewer_role": r["reviewer_role"],
            "review_comment": r["review_comment"]
        }

    def list_drafts(self, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            if status_filter:
                cursor.execute("SELECT * FROM review_drafts WHERE status = ? ORDER BY created_at DESC", (status_filter,))
            else:
                cursor.execute("SELECT * FROM review_drafts ORDER BY created_at DESC")
            rows = cursor.fetchall()
            conn.close()

        drafts = []
        for r in rows:
            content = r["content"]
            try:
                content = json.loads(content)
            except Exception:
                pass

            trace = []
            try:
                trace = json.loads(r["reasoning_trace"])
            except Exception:
                pass

            drafts.append({
                "review_id": r["review_id"],
                "job_id": r["job_id"],
                "title": r["title"],
                "deliverable_type": r["deliverable_type"],
                "content": content,
                "reasoning_trace": trace,
                "status": r["status"],
                "mandatory_review": bool(r["mandatory_review"]),
                "created_at": r["created_at"],
                "reviewed_at": r["reviewed_at"],
                "reviewer_role": r["reviewer_role"],
                "review_comment": r["review_comment"]
            })
        return drafts

approval_gate = ApprovalGate()
