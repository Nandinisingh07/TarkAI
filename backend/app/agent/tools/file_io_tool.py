from pathlib import Path
from app.tools.file_io import read_file as legacy_read_file, write_file as legacy_write_file
from app.audit_logger import audit_logger

def read_file(path: str, job_id: str = "orchestrator") -> str:
    """Sandboxed file reader tool."""
    res = legacy_read_file(path)
    audit_logger.log_event(
        action="TOOL_EXECUTED",
        resource=f"read_file({path})",
        status="SUCCESS",
        details={"tool": "read_file", "path": path, "job_id": job_id, "bytes": len(res)}
    )
    return res

def write_file(path: str, content: str, job_id: str = "orchestrator") -> str:
    """Sandboxed file writer tool."""
    res = legacy_write_file(path, content)
    audit_logger.log_event(
        action="TOOL_EXECUTED",
        resource=f"write_file({path})",
        status="SUCCESS",
        details={"tool": "write_file", "path": path, "job_id": job_id, "bytes": len(content)}
    )
    return res
