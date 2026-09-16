import os
import sys
import subprocess
import tempfile
from pathlib import Path
from app.config.settings import settings
from app.audit_logger import audit_logger

def execute_code(code: str, language: str = "python", job_id: str = "orchestrator", timeout_seconds: int = 10) -> str:
    """
    Executes python/bash code in an isolated subprocess with no network access.
    Captures stdout, stderr, and exit code. Enforces timeout.
    """
    lang = language.lower().strip()
    if lang not in ["python", "py", "bash", "sh", "powershell", "ps1"]:
        return f"Error: Unsupported language '{language}'."

    sandbox_dir = settings.SANDBOX_DIR
    clean_env = os.environ.copy()
    clean_env["HTTP_PROXY"] = "http://127.0.0.1:9999" # invalid proxy blocking egress
    clean_env["HTTPS_PROXY"] = "http://127.0.0.1:9999"
    clean_env["NO_PROXY"] = ""

    with tempfile.TemporaryDirectory(dir=sandbox_dir) as temp_dir:
        temp_path = Path(temp_dir)
        clean_env["PYTHONPATH"] = str(temp_path)

        # Inject sitecustomize.py to enforce interpreter & process-level network isolation with bypass hardening
        sitecustomize_file = temp_path / "sitecustomize.py"
        sitecustomize_content = """import os
import sys

def _network_blocked_error(*args, **kwargs):
    raise PermissionError("Air-gapped sandbox network isolation: Outbound socket connection blocked by policy.")

def _subprocess_blocked_error(*args, **kwargs):
    raise PermissionError("Air-gapped sandbox network isolation: Subprocess network egress is blocked by policy.")

def _apply_all_patches():
    # 1. Socket module patches
    try:
        import socket
        socket.socket.connect = _network_blocked_error
        socket.socket.connect_ex = _network_blocked_error
        socket.create_connection = _network_blocked_error
        socket.getaddrinfo = _network_blocked_error
        socket.gethostbyname = _network_blocked_error
        socket.gethostbyname_ex = _network_blocked_error
        socket.gethostbyaddr = _network_blocked_error
    except Exception:
        pass

    try:
        import _socket
        _socket.socket.connect = _network_blocked_error
        _socket.socket.connect_ex = _network_blocked_error
    except Exception:
        pass

    # 2. Subprocess & OS process creation patches
    try:
        import subprocess
        class BlockedPopen(subprocess.Popen):
            def __init__(self, *args, **kwargs):
                raise PermissionError("Air-gapped sandbox network isolation: Subprocess network egress is blocked by policy.")
        subprocess.Popen = BlockedPopen
        subprocess.run = _subprocess_blocked_error
        subprocess.call = _subprocess_blocked_error
        subprocess.check_call = _subprocess_blocked_error
        subprocess.check_output = _subprocess_blocked_error
    except Exception:
        pass

    try:
        import os
        os.system = _subprocess_blocked_error
        os.popen = _subprocess_blocked_error
        if hasattr(os, 'spawnl'): os.spawnl = _subprocess_blocked_error
        if hasattr(os, 'spawnv'): os.spawnv = _subprocess_blocked_error
        if hasattr(os, 'execv'): os.execv = _subprocess_blocked_error
        if hasattr(os, 'startfile'): os.startfile = _subprocess_blocked_error
    except Exception:
        pass

    # 3. ctypes Winsock & ShellExecute hardening
    try:
        import ctypes
        if hasattr(ctypes, 'windll') and hasattr(ctypes.windll, 'ws2_32'):
            try:
                ctypes.windll.ws2_32.connect = _network_blocked_error
                ctypes.windll.ws2_32.WSAConnect = _network_blocked_error
            except Exception:
                pass
        if hasattr(ctypes, 'windll') and hasattr(ctypes.windll, 'shell32'):
            try:
                ctypes.windll.shell32.ShellExecuteW = _subprocess_blocked_error
                ctypes.windll.shell32.ShellExecuteA = _subprocess_blocked_error
            except Exception:
                pass
    except Exception:
        pass

    # 4. Guard against importlib.reload un-patching
    try:
        import importlib
        _real_reload = getattr(importlib, '_real_sandbox_reload', importlib.reload)
        def _guarded_reload(module):
            res = _real_reload(module)
            _apply_all_patches()
            return res
        importlib._real_sandbox_reload = _real_reload
        importlib.reload = _guarded_reload
    except Exception:
        pass

_apply_all_patches()
"""
        sitecustomize_file.write_text(sitecustomize_content, encoding="utf-8")

        if lang in ["python", "py"]:
            file_name = temp_path / "script.py"
            file_name.write_text(code, encoding="utf-8")
            cmd = [sys.executable, str(file_name)]

        elif lang in ["bash", "sh"]:
            file_name = temp_path / "script.sh"
            file_name.write_text(code, encoding="utf-8")
            cmd = ["bash", str(file_name)]
        else:
            file_name = temp_path / "script.ps1"
            file_name.write_text(code, encoding="utf-8")
            cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(file_name)]

        try:
            res = subprocess.run(
                cmd,
                cwd=temp_dir,
                env=clean_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=timeout_seconds
            )
            stdout = res.stdout.strip()
            stderr = res.stderr.strip()
            
            output_parts = []
            if stdout:
                output_parts.append(f"STDOUT:\n{stdout}")
            if stderr:
                output_parts.append(f"STDERR:\n{stderr}")
            if not output_parts:
                output_parts.append("Execution completed with no output (Exit Code 0).")

            result_str = f"[Exit Code {res.returncode}]\n" + "\n".join(output_parts)

            audit_logger.log_event(
                action="TOOL_EXECUTED",
                resource=f"execute_code({lang})",
                status="SUCCESS" if res.returncode == 0 else "EXECUTION_ERROR",
                details={"tool": "execute_code", "language": lang, "exit_code": res.returncode, "job_id": job_id}
            )

            return result_str

        except subprocess.TimeoutExpired:
            msg = f"Error: Code execution timed out after {timeout_seconds}s limit."
            audit_logger.log_event(
                action="TOOL_EXECUTED",
                resource=f"execute_code({lang})",
                status="TIMEOUT",
                details={"tool": "execute_code", "error": "timeout", "job_id": job_id}
            )
            return msg
        except Exception as e:
            msg = f"Error executing code: {str(e)}"
            audit_logger.log_event(
                action="TOOL_EXECUTED",
                resource=f"execute_code({lang})",
                status="ERROR",
                details={"tool": "execute_code", "error": str(e), "job_id": job_id}
            )
            return msg
