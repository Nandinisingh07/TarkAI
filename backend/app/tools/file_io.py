import os
from pathlib import Path
from app.config.settings import settings

def _get_safe_path(rel_or_abs_path: str) -> Path:
    sandbox = settings.SANDBOX_DIR.resolve()
    target = (sandbox / rel_or_abs_path).resolve()
    
    # Check if target is inside sandbox directory
    if not str(target).startswith(str(sandbox)):
        # Allow reading from uploads/ if specified
        uploads = settings.UPLOADS_DIR.resolve()
        target_upload = (uploads / rel_or_abs_path).resolve()
        if str(target_upload).startswith(str(uploads)):
            return target_upload
        raise PermissionError(f"Access denied: Path '{rel_or_abs_path}' is outside sandbox/uploads directory.")
    return target

def read_file(path: str) -> str:
    """Reads file content from the sandboxed workspace."""
    try:
        target = _get_safe_path(path)
        if not target.exists():
            return f"Error: File '{path}' does not exist."
        with open(target, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file '{path}': {str(e)}"

def write_file(path: str, content: str) -> str:
    """Writes text content to a file in the sandboxed workspace."""
    try:
        target = _get_safe_path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Successfully written {len(content)} characters to '{target.name}' in sandbox."
    except Exception as e:
        return f"Error writing file '{path}': {str(e)}"
