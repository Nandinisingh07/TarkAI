import sys
import subprocess
import tempfile
import os
from pathlib import Path

def execute_code(code: str, language: str = "python") -> str:
    """
    Executes code in a sandboxed subprocess with a 10-second timeout.
    Supports python and bash/powershell scripts safely.
    """
    lang = language.lower().strip()
    if lang not in ["python", "py", "bash", "sh", "powershell", "ps1"]:
        return f"Error: Unsupported language '{language}'. Supported: python, bash, powershell."

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Isolated env without sensitive environment tokens
        clean_env = os.environ.copy()
        clean_env["HTTP_PROXY"] = ""
        clean_env["HTTPS_PROXY"] = ""
        clean_env["NO_PROXY"] = "*"

        if lang in ["python", "py"]:
            file_name = temp_path / "script.py"
            file_name.write_text(code, encoding="utf-8")
            cmd = [sys.executable, str(file_name)]
        elif lang in ["bash", "sh"]:
            file_name = temp_path / "script.sh"
            file_name.write_text(code, encoding="utf-8")
            cmd = ["bash", str(file_name)]
        else:  # powershell
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
                timeout=10
            )
            stdout = res.stdout.strip()
            stderr = res.stderr.strip()
            
            output = []
            if stdout:
                output.append(f"STDOUT:\n{stdout}")
            if stderr:
                output.append(f"STDERR:\n{stderr}")
            if not output:
                output.append("Execution completed with no output (Exit Code 0).")
            
            return f"[Exit Code {res.returncode}]\n" + "\n".join(output)

        except subprocess.TimeoutExpired:
            return "Error: Code execution timed out after 10 seconds limit."
        except Exception as e:
            return f"Error executing code: {str(e)}"
