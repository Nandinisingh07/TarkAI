import os
import json
import sqlite3
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = DATA_DIR / "audit.log"
DB_FILE = DATA_DIR / "audit_store.db"

class AuditLogger:
    """
    Append-only local audit log daemon for TarkAI air-gapped system.
    Logs queries, document generations, approvals, file access, and security events.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    action TEXT NOT NULL,
                    resource TEXT,
                    user_role TEXT DEFAULT 'system',
                    status TEXT DEFAULT 'SUCCESS',
                    details TEXT
                )
            """)
            conn.commit()
            conn.close()

    def log_event(self, action: str, resource: str = "", user_role: str = "system", status: str = "SUCCESS", details: Dict[str, Any] = None) -> Dict[str, Any]:
        timestamp = datetime.utcnow().isoformat() + "Z"
        details_str = json.dumps(details or {})
        
        event = {
            "timestamp": timestamp,
            "action": action,
            "resource": resource,
            "user_role": user_role,
            "status": status,
            "details": details or {}
        }

        with self.lock:
            # Append-only text log
            log_line = f"[{timestamp}] [{status}] [{user_role.upper()}] {action} - Resource: '{resource}' | Details: {details_str}\n"
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(log_line)

            # SQLite persistence
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO audit_logs (timestamp, action, resource, user_role, status, details)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (timestamp, action, resource, user_role, status, details_str))
            conn.commit()
            conn.close()

        return event

    def get_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            conn.close()

            logs = []
            for r in rows:
                logs.append({
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "action": r["action"],
                    "resource": r["resource"],
                    "user_role": r["user_role"],
                    "status": r["status"],
                    "details": json.loads(r["details"]) if r["details"] else {}
                })
            return logs

audit_logger = AuditLogger()
