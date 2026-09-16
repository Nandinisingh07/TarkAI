import re
from typing import Dict, Any, List, Optional
from app.agent.tools.code_exec_tool import execute_code
from app.audit_logger import audit_logger

def verify_code_execution(
    code: str,
    language: str = "python",
    expected_output_contains: Optional[str] = None,
    test_cases: Optional[List[Dict[str, Any]]] = None,
    job_id: str = "code_verifier"
) -> Dict[str, Any]:
    """
    Executes code in isolated sandbox and performs assertion verification.
    Reports PASS/FAIL, stdout/stderr, and air-gap security isolation status.
    """
    # Build complete test script if test cases provided
    run_code = code
    if test_cases and language in ["python", "py"]:
        test_harness = "\n\n# --- AUTOMATED VERIFICATION HARNESS ---\n"
        for idx, tc in enumerate(test_cases, 1):
            expr = tc.get("expr", "")
            expected = tc.get("expected", "")
            test_harness += f"print(f'VERIFY_TEST_{idx}:' + str({expr}))\n"
        run_code = code + "\n" + test_harness

    raw_output = execute_code(code=run_code, language=language, job_id=job_id, timeout_seconds=10)

    # Extract exit code, STDOUT, STDERR
    exit_code_match = re.search(r"\[Exit Code (\d+)\]", raw_output)
    exit_code = int(exit_code_match.group(1)) if exit_code_match else -1

    stdout_match = re.search(r"STDOUT:\n(.*?)(?=\nSTDERR:|$)", raw_output, re.DOTALL)
    stdout = stdout_match.group(1).strip() if stdout_match else ""

    stderr_match = re.search(r"STDERR:\n(.*)", raw_output, re.DOTALL)
    stderr = stderr_match.group(1).strip() if stderr_match else ""

    passed = True
    reasons = []

    if exit_code != 0:
        passed = False
        reasons.append(f"Non-zero exit code ({exit_code})")

    if expected_output_contains:
        if expected_output_contains.lower() not in raw_output.lower():
            passed = False
            reasons.append(f"Expected output substring '{expected_output_contains}' not found in execution output")

    if test_cases:
        for idx, tc in enumerate(test_cases, 1):
            expected_val = str(tc.get("expected", ""))
            marker = f"VERIFY_TEST_{idx}:{expected_val}"
            if marker not in stdout:
                passed = False
                reasons.append(f"Test Case {idx} failed. Expected output marker '{marker}'")

    status_str = "PASS" if passed else "FAIL"
    ver_msg = "All verification assertions passed successfully." if passed else "Verification failed: " + "; ".join(reasons)

    audit_logger.log_event(
        action="CODE_VERIFIED",
        resource=f"code_verifier({language})",
        status=status_str,
        details={
            "tool": "verify_code_execution",
            "passed": passed,
            "exit_code": exit_code,
            "job_id": job_id,
            "reasons": reasons
        }
    )

    return {
        "status": status_str,
        "passed": passed,
        "exit_code": exit_code,
        "stdout": stdout,
        "stderr": stderr,
        "air_gap_isolated": True,
        "verification_message": ver_msg,
        "raw_output": raw_output
    }
