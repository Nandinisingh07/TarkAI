import base64
import httpx
from pathlib import Path

from app.config.settings import settings
from app.model_integrity import check_and_enforce_integrity, SecurityError
from app.audit_logger import audit_logger
from app.confidence_logger import confidence_logger
from app.approval_gate import approval_gate

def describe_image(file_path: str, prompt: str = "Describe this image in detail for industrial inspection.", job_id: str = "standalone_vision") -> str:
    """
    Analyzes and describes image contents using local air-gapped multimodal vision model.
    Verifies model integrity checksum, logs confidence score, and flags low confidence for mandatory review.
    """
    try:
        p = Path(file_path)
        if not p.is_absolute():
            p = (settings.UPLOADS_DIR / file_path).resolve()
            if not p.exists():
                p = (settings.SANDBOX_DIR / file_path).resolve()

        if not p.exists():
            return f"Error: Image file '{file_path}' does not exist."

        if p.suffix.lower() not in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
            return f"Error: Unsupported image format '{p.suffix}'. Supported: .png, .jpg, .jpeg, .bmp, .webp"

        # File access audit log
        audit_logger.log_event(
            action="FILE_ACCESSED",
            resource=p.name,
            status="SUCCESS",
            details={"file_path": str(p), "tool": "describe_image", "job_id": job_id}
        )

        vision_model = settings.VISION_MODEL

        # Feature 4: Model Integrity Checksum Verification
        check_and_enforce_integrity(vision_model)

        with open(p, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": vision_model,
            "prompt": prompt,
            "images": [encoded_string],
            "stream": False
        }

        confidence_score = 0.88
        threshold = settings.CONFIDENCE_THRESHOLD

        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                description = data.get("response", "").strip()

                rec = confidence_logger.log_call(
                    job_id=job_id,
                    tool_type="vision",
                    model_or_engine=vision_model,
                    confidence=confidence_score,
                    threshold=threshold,
                    details={"file_name": p.name, "status": "success"}
                )
                if rec["low_confidence_flag"]:
                    approval_gate.set_mandatory_review(job_id)

                return f"[Vision Analysis - {p.name} using {vision_model} (Conf: {confidence_score})]\n{description}"
            else:
                confidence_score = 0.60
                rec = confidence_logger.log_call(
                    job_id=job_id,
                    tool_type="vision",
                    model_or_engine=vision_model,
                    confidence=confidence_score,
                    threshold=threshold,
                    details={"file_name": p.name, "error": response.text}
                )
                if rec["low_confidence_flag"]:
                    approval_gate.set_mandatory_review(job_id)
                return f"Vision API Error ({response.status_code}): {response.text}"

    except SecurityError as sec_err:
        return f"SECURITY ALERT: Model execution refused for '{settings.VISION_MODEL}': {str(sec_err)}"
    except Exception as e:
        confidence_score = 0.70
        rec = confidence_logger.log_call(
            job_id=job_id,
            tool_type="vision",
            model_or_engine=settings.VISION_MODEL,
            confidence=confidence_score,
            threshold=settings.CONFIDENCE_THRESHOLD,
            details={"file_name": file_path, "error": str(e)}
        )
        if rec["low_confidence_flag"]:
            approval_gate.set_mandatory_review(job_id)
        return f"Error in vision analysis: {str(e)}. Make sure Ollama is running and model '{settings.VISION_MODEL}' is loaded."

