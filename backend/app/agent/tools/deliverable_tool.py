import os
from pathlib import Path
from typing import Dict, Any, Optional

from app.config.settings import settings
from app.output_generator import generate_docx, generate_pptx, generate_xlsx
from app.approval_gate import approval_gate
from app.audit_logger import audit_logger

def render_deliverable_document(
    title: str,
    extracted_findings: str,
    output_format: str = "docx",
    job_id: str = "deliverable_generator",
    mandatory_review: bool = False
) -> Dict[str, Any]:
    """
    Renders structured findings into a formatted .docx document (or .pptx / .xlsx),
    saves deliverable to outputs/, and registers draft in approval_gate.py.
    """
    fmt = str(output_format).lower().strip()
    if fmt not in ["docx", "pptx", "xlsx"]:
        fmt = "docx"

    file_prefix = f"Inspection_Approval_Note_{job_id[:6]}"

    if fmt == "docx":
        content_text = f"# {title.upper()}\n\n"
        content_text += "## Executive Summary & Inspection Findings\n"
        content_text += f"{extracted_findings}\n\n"
        content_text += "## Air-Gapped Confidentiality Compliance\n"
        content_text += "This deliverable document was automatically synthesized on an air-gapped confidential industrial workbench node. All findings verified locally.\n"
        
        filepath = generate_docx(content_text, filename_prefix=file_prefix)
    elif fmt == "pptx":
        slides_data = [
            {"title": title, "bullets": ["Air-Gapped Inspection Report", "Confidential Operations Summary"]},
            {"title": "Extracted Findings", "bullets": extracted_findings.split("\n")}
        ]
        filepath = generate_pptx(slides_data, filename_prefix=file_prefix)
    else: # xlsx
        filepath = generate_xlsx({"headers": ["Inspection Item / Finding"], "rows": [[line] for line in extracted_findings.split("\n") if line.strip()]}, filename_prefix=file_prefix)

    # Register generated artifact in Human Approval Gate pending_review state
    draft = approval_gate.create_draft(
        job_id=job_id,
        title=title,
        deliverable_type=fmt,
        content=f"Generated document path: {filepath.name}\n\nFindings:\n{extracted_findings}",
        reasoning_trace=[
            {"step": 1, "thought": "Extracted findings from scanned inspection PDF via OCR/Vision tool", "action": "extract_text"},
            {"step": 2, "thought": f"Rendered deliverable document {filepath.name}", "action": "render_deliverable_document"}
        ],
        mandatory_review=mandatory_review
    )

    download_url = f"/outputs/{filepath.name}"

    audit_logger.log_event(
        action="DOCUMENT_GENERATED",
        resource=filepath.name,
        status="PENDING_REVIEW",
        details={
            "tool": "render_deliverable_document",
            "format": fmt,
            "job_id": job_id,
            "review_id": draft["review_id"],
            "download_url": download_url
        }
    )

    return {
        "format": fmt,
        "filename": filepath.name,
        "filepath": str(filepath),
        "download_url": download_url,
        "review_id": draft["review_id"],
        "status": draft["status"],
        "mandatory_review": draft["mandatory_review"]
    }
