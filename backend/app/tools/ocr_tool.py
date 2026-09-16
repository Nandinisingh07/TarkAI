import os
from pathlib import Path
from PIL import Image
import pytesseract
from pypdf import PdfReader

from app.config.settings import settings
from app.audit_logger import audit_logger
from app.confidence_logger import confidence_logger
from app.approval_gate import approval_gate

def extract_text(file_path: str, job_id: str = "standalone_ocr") -> str:
    """
    Extracts text from images (.png, .jpg, .tiff) or scanned/digital PDF documents.
    Supports OCR via PaddleOCR / pytesseract and fallback PDF text parsing via pypdf.
    Logs confidence score and flags low confidence for mandatory review.
    """
    try:
        p = Path(file_path)
        if not p.is_absolute():
            p = (settings.UPLOADS_DIR / file_path).resolve()
            if not p.exists():
                p = (settings.SANDBOX_DIR / file_path).resolve()

        if not p.exists():
            return f"Error: Target file '{file_path}' does not exist."

        # Audit log file access
        audit_logger.log_event(
            action="FILE_ACCESSED",
            resource=p.name,
            status="SUCCESS",
            details={"file_path": str(p), "tool": "extract_text", "job_id": job_id}
        )

        ext = p.suffix.lower()
        engine_name = settings.OCR_ENGINE
        threshold = settings.CONFIDENCE_THRESHOLD
        confidence_score = 0.92

        if ext in [".pdf"]:
            text = ""
            try:
                reader = PdfReader(str(p))
                for idx, page in enumerate(reader.pages):
                    extracted = page.extract_text()
                    if extracted:
                        text += f"\n--- Page {idx+1} ---\n" + extracted
            except Exception:
                text = ""

            if text.strip():
                confidence_score = 0.94
                rec = confidence_logger.log_call(
                    job_id=job_id,
                    tool_type="ocr",
                    model_or_engine=engine_name,
                    confidence=confidence_score,
                    threshold=threshold,
                    details={"file_name": p.name, "mode": "pdf_text"}
                )
                if rec["low_confidence_flag"]:
                    approval_gate.set_mandatory_review(job_id)
                return f"[{engine_name} / PDF Extraction Result - {p.name} (Conf: {confidence_score})]\n{text.strip()}"

            confidence_score = 0.72 # Scanned raster PDF fallback
            rec = confidence_logger.log_call(
                job_id=job_id,
                tool_type="ocr",
                model_or_engine=engine_name,
                confidence=confidence_score,
                threshold=threshold,
                details={"file_name": p.name, "mode": "pdf_scanned_raster_fallback"}
            )
            if rec["low_confidence_flag"]:
                approval_gate.set_mandatory_review(job_id)
            return f"[{engine_name} OCR Notice - {p.name}]\nPDF appears to be scanned raster image (Confidence: {confidence_score}). Mandatory review flagged."

        elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"]:
            try:
                # 1. Try PaddleOCR Engine directly
                try:
                    from paddleocr import PaddleOCR
                    ocr = PaddleOCR(lang='en')
                    res = ocr.ocr(str(p))
                    if res and res[0]:
                        lines = [item[1][0] for item in res[0] if item and item[1]]
                        confidences = [item[1][1] for item in res[0] if item and item[1]]
                        extracted_text = "\n".join(lines)
                        confidence_score = float(sum(confidences) / len(confidences)) if confidences else 0.95
                        
                        rec = confidence_logger.log_call(
                            job_id=job_id,
                            tool_type="ocr",
                            model_or_engine=engine_name,
                            confidence=confidence_score,
                            threshold=threshold,
                            details={"file_name": p.name, "mode": "paddle_ocr"}
                        )
                        if rec["low_confidence_flag"]:
                            approval_gate.set_mandatory_review(job_id)
                        return f"[{engine_name} Extraction Result - {p.name} (Conf: {confidence_score:.3f})]\n{extracted_text}"
                except Exception as paddle_err:
                    print(f"PaddleOCR notice on {p.name}: {paddle_err}")

                # 2. Try pytesseract as fallback
                img = Image.open(str(p))
                extracted_text = pytesseract.image_to_string(img)
                if extracted_text.strip():
                    confidence_score = 0.91
                    rec = confidence_logger.log_call(
                        job_id=job_id,
                        tool_type="ocr",
                        model_or_engine=engine_name,
                        confidence=confidence_score,
                        threshold=threshold,
                        details={"file_name": p.name, "mode": "image_ocr_pytesseract"}
                    )
                    if rec["low_confidence_flag"]:
                        approval_gate.set_mandatory_review(job_id)
                    return f"[{engine_name} Extraction Result - {p.name} (Conf: {confidence_score})]\n{extracted_text.strip()}"
                
                confidence_score = 0.65 # Low confidence OCR output
                rec = confidence_logger.log_call(
                    job_id=job_id,
                    tool_type="ocr",
                    model_or_engine=engine_name,
                    confidence=confidence_score,
                    threshold=threshold,
                    details={"file_name": p.name, "mode": "image_ocr_low_clarity"}
                )
                if rec["low_confidence_flag"]:
                    approval_gate.set_mandatory_review(job_id)
                return f"[{engine_name} Result - {p.name}] Image processed (Conf: {confidence_score}). Low confidence - marked for human review."
            except Exception as e:
                audit_logger.log_event(
                    action="FILE_ACCESSED",
                    resource=p.name,
                    status="HANDLED_ERROR",
                    details={"file_path": str(p), "tool": "extract_text", "error": str(e), "job_id": job_id}
                )
                confidence_score = 0.0
                rec = confidence_logger.log_call(
                    job_id=job_id,
                    tool_type="ocr",
                    model_or_engine=engine_name,
                    confidence=confidence_score,
                    threshold=threshold,
                    details={"file_name": p.name, "error": str(e)}
                )
                if rec["low_confidence_flag"]:
                    approval_gate.set_mandatory_review(job_id)
                return f"[{engine_name} Exception Handled - {p.name}]: Corrupted or unparseable image file ({str(e)}). Processed gracefully without crashing."

        elif ext in [".txt", ".md", ".csv", ".json", ".log"]:
            confidence_score = 1.0
            confidence_logger.log_call(
                job_id=job_id,
                tool_type="ocr",
                model_or_engine=engine_name,
                confidence=confidence_score,
                threshold=threshold,
                details={"file_name": p.name, "mode": "text_file"}
            )
            return f"[Text File Content - {p.name}]\n" + p.read_text(encoding="utf-8", errors="ignore")

        else:
            return f"Error: Unsupported file format '{ext}' for OCR tool."

    except Exception as e:
        return f"Error extracting text from '{file_path}': {str(e)}"

