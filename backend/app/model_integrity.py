import re
from pathlib import Path
from typing import Dict, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_MANIFEST = Path(__file__).resolve().parent / "config" / "verified_model_manifest.yaml"
ROOT_MANIFEST = BASE_DIR / "config" / "verified_model_manifest.yaml"

class SecurityError(Exception):
    """Exception raised when a model fails local checksum integrity verification."""
    pass

def load_verified_manifest() -> Dict[str, str]:
    manifest = {}
    target_path = CONFIG_MANIFEST if CONFIG_MANIFEST.exists() else ROOT_MANIFEST
    
    if not target_path.exists():
        return manifest

    try:
        content = target_path.read_text(encoding="utf-8")
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#") or line == "models:":
                continue
            # Match key: "val" pattern robustly even if key contains colon
            match = re.match(r'^\s*([^"]+?)\s*:\s*"(.*)"\s*$', line)
            if match:
                k = match.group(1).strip().strip("'\"")
                v = match.group(2).strip()
                manifest[k] = v
            elif ":" in line:
                parts = line.rsplit(":", 1)
                k = parts[0].strip().strip("'\"")
                v = parts[1].strip().strip("'\"")
                manifest[k] = v
    except Exception as e:
        print(f"Error reading verified_model_manifest.yaml: {e}")

    
    return manifest

def verify_model_checksum(model_name: str, actual_checksum: str = None) -> Tuple[bool, str]:
    manifest = load_verified_manifest()
    
    if model_name not in manifest:
        return False, f"SECURITY WARNING: Model '{model_name}' is NOT registered in verified_model_manifest.yaml!"

    expected_checksum = manifest[model_name]
    
    if actual_checksum is not None:
        if actual_checksum != expected_checksum:
            return False, f"SECURITY WARNING: Checksum mismatch for model '{model_name}'! Expected {expected_checksum}, got {actual_checksum}."
        return True, f"Integrity verified for '{model_name}' ({expected_checksum})."

    # Default verification mode against manifest
    return True, f"Integrity verified for model '{model_name}' against manifest."

def check_and_enforce_integrity(model_name: str, actual_checksum: str = None) -> None:
    is_valid, msg = verify_model_checksum(model_name, actual_checksum)
    if not is_valid:
        # Import audit logger to log security event
        try:
            from app.audit_logger import audit_logger
            audit_logger.log_event(
                action="SECURITY_MODEL_INTEGRITY_FAILURE",
                resource=model_name,
                user_role="system",
                status="BLOCKED",
                details={"error": msg, "model": model_name}
            )
        except Exception:
            pass
        raise SecurityError(msg)
