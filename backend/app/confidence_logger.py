import json
import sqlite3
import threading
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = DATA_DIR / "confidence_logs.db"

class ConfidenceLogger:
    """
    SQLite-backed store for tracking OCR and vision call confidence scores.
    Aggregates stats: total calls, average confidence, low-confidence %, flagged count.
    """
    def __init__(self):
        self.lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS confidence_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    job_id TEXT NOT NULL,
                    tool_type TEXT NOT NULL,
                    model_or_engine TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    low_confidence_flag BOOLEAN NOT NULL,
                    details TEXT
                )
            """)
            conn.commit()
            conn.close()

    def log_call(self, job_id: str, tool_type: str, model_or_engine: str, confidence: float, threshold: float = 0.8, details: Dict[str, Any] = None) -> Dict[str, Any]:
        timestamp = datetime.utcnow().isoformat() + "Z"
        confidence = round(max(0.0, min(1.0, float(confidence))), 4)
        low_confidence_flag = bool(confidence < threshold)
        details_str = json.dumps(details or {})

        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO confidence_logs (timestamp, job_id, tool_type, model_or_engine, confidence, low_confidence_flag, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (timestamp, job_id, tool_type, model_or_engine, confidence, low_confidence_flag, details_str))
            conn.commit()
            conn.close()

        record = {
            "timestamp": timestamp,
            "job_id": job_id,
            "tool_type": tool_type,
            "model_or_engine": model_or_engine,
            "confidence": confidence,
            "low_confidence_flag": low_confidence_flag,
            "details": details or {}
        }
        return record

    def get_stats(self) -> Dict[str, Any]:
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*), AVG(confidence), SUM(CASE WHEN low_confidence_flag = 1 THEN 1 ELSE 0 END) FROM confidence_logs")
            row = cursor.fetchone()
            conn.close()

        total_calls = row[0] or 0
        avg_confidence = round(row[1], 4) if row[1] is not None else 1.0
        flagged_count = row[2] or 0
        low_conf_pct = round((flagged_count / total_calls * 100.0), 2) if total_calls > 0 else 0.0

        return {
            "total_calls": total_calls,
            "average_confidence": avg_confidence,
            "low_confidence_pct": low_conf_pct,
            "flagged_count": flagged_count
        }

    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.lock:
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM confidence_logs ORDER BY id DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            conn.close()

            logs = []
            for r in rows:
                logs.append({
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "job_id": r["job_id"],
                    "tool_type": r["tool_type"],
                    "model_or_engine": r["model_or_engine"],
                    "confidence": r["confidence"],
                    "low_confidence_flag": bool(r["low_confidence_flag"]),
                    "details": json.loads(r["details"]) if r["details"] else {}
                })
            return logs

confidence_logger = ConfidenceLogger()
