import json
import openpyxl
from pathlib import Path
from typing import Union, Dict, Any, List
from app.config.settings import settings
from app.audit_logger import audit_logger

def _get_spreadsheet_path(file_path: str) -> Path:
    p = Path(file_path)
    if not p.is_absolute():
        p = (settings.SANDBOX_DIR / file_path).resolve()
    return p

def write_spreadsheet(file_path: str, data: Union[str, dict, list], sheet_name: str = "Sheet1", job_id: str = "orchestrator") -> str:
    """
    Creates or updates an Excel spreadsheet (.xlsx) with headers, rows, and optional totals.
    data format: {"headers": ["col1", "col2"], "rows": [["val1", 10], ["val2", 20]]}
    """
    try:
        p = _get_spreadsheet_path(file_path)
        p.parent.mkdir(parents=True, exist_ok=True)

        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                lines = [line.split(",") for line in data.split("\n") if line.strip()]
                data = {"headers": lines[0] if lines else ["Col 1"], "rows": lines[1:] if len(lines) > 1 else lines}

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = sheet_name

        if isinstance(data, dict):
            # Preferred format: {"headers": [...], "rows": [[...], ...]}
            if "headers" in data or "rows" in data:
                headers = data.get("headers", ["Parameter", "Value"])
                rows = data.get("rows", [])
            else:
                # Also accept a simple key/value dictionary from the local model.
                headers = ["Parameter", "Value"]
                rows = [[str(key), str(value)] for key, value in data.items()]
        elif isinstance(data, list):
            headers = ["Data"]
            rows = [[str(row)] if not isinstance(row, list) else row for row in data]
        else:
            headers = ["Data"]
            rows = [[str(data)]]

        ws.append(headers)
        for row in rows:
            ws.append(row if isinstance(row, list) else [str(row)])

        wb.save(str(p))

        audit_logger.log_event(
            action="TOOL_EXECUTED",
            resource=f"write_spreadsheet({p.name})",
            status="SUCCESS",
            details={"tool": "write_spreadsheet", "file": p.name, "rows_written": len(rows), "job_id": job_id}
        )

        return f"Successfully generated spreadsheet '{p.name}' with {len(rows)} rows at '{str(p)}'."
    except Exception as e:
        audit_logger.log_event(
            action="TOOL_EXECUTED",
            resource=f"write_spreadsheet({file_path})",
            status="ERROR",
            details={"tool": "write_spreadsheet", "error": str(e), "job_id": job_id}
        )
        return f"Error writing spreadsheet '{file_path}': {str(e)}"

def read_spreadsheet(file_path: str, sheet_name: str = None, job_id: str = "orchestrator") -> str:
    """Reads spreadsheet (.xlsx / .csv) content and returns JSON structure."""
    try:
        p = _get_spreadsheet_path(file_path)
        if not p.exists():
            return f"Error: Spreadsheet '{file_path}' does not exist."

        wb = openpyxl.load_workbook(str(p), data_only=True)
        sheet = wb[sheet_name] if sheet_name and sheet_name in wb.sheetnames else wb.active

        rows = list(sheet.iter_rows(values_only=True))
        if not rows:
            return f"Spreadsheet '{p.name}' is empty."

        headers = [str(cell) for cell in rows[0]]
        data_rows = [[str(cell) if cell is not None else "" for cell in r] for r in rows[1:]]

        result = {
            "filename": p.name,
            "headers": headers,
            "row_count": len(data_rows),
            "rows": data_rows[:50] # cap preview
        }

        audit_logger.log_event(
            action="TOOL_EXECUTED",
            resource=f"read_spreadsheet({p.name})",
            status="SUCCESS",
            details={"tool": "read_spreadsheet", "file": p.name, "rows_read": len(data_rows), "job_id": job_id}
        )

        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Error reading spreadsheet '{file_path}': {str(e)}"
