import os
import re
import json
import httpx
from datetime import datetime
from typing import Dict, Any, List, Optional

from app.config.model_registry import model_registry
from app.config.settings import settings
from app.audit_logger import audit_logger

STAGE1_VISION_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".bmp", ".tiff", ".webp"]
STAGE1_CODE_KEYWORDS = [
    "debug", "write a function", "fix this code", "fix bug", "python script",
    "def ", "import ", "const ", "class ", "syntax error", "traceback", "exception"
]
STAGE1_CODE_EXTENSIONS = [".py", ".js", ".ts", ".jsx", ".tsx", ".sh", ".sql", ".cpp", ".java"]
STAGE1_DOC_KEYWORDS = [
    "summarize", "draft approval note", "sop", "search manual", "drawing",
    "search manual/drawing", "inspection guide", "policy report"
]

class ModelRouter:
    """
    Two-Stage Hybrid Router for TarkAI / SIH PS26117.
    - Stage 1: Fast deterministic rule matching (clear signals -> instant route, zero model call latency).
    - Stage 2: LLM Tie-breaker via settings.GENERAL_MODEL (ambiguous input -> low-temp JSON classification call).
    Every routing decision is logged to local audit_logger with matched_stage, matched_signal, and confidence.
    100% config-driven, zero hardcoded model names.
    """

    @staticmethod
    def _evaluate_stage1(task_description: str, attached_files: List[str] = None) -> Optional[Dict[str, Any]]:
        text_lower = task_description.lower().strip()
        files = attached_files or []

        # 1. Vision signal (Attached files with image/pdf extensions or explicit scanned keywords)
        for f in files:
            ext = os.path.splitext(f.lower())[1]
            if ext in STAGE1_VISION_EXTENSIONS:
                return {
                    "matched_stage": "stage1",
                    "matched_signal": f"Attached file extension '{ext}'",
                    "task_type": "vision",
                    "selected_model": settings.VISION_MODEL,
                    "confidence": 1.0
                }
        
        if any(k in text_lower for k in ["scanned", "ocr", "photo of", "image of", "diagram png"]):
            return {
                "matched_stage": "stage1",
                "matched_signal": "Scanned/OCR visual document keyword",
                "task_type": "vision",
                "selected_model": settings.VISION_MODEL,
                "confidence": 0.95
            }

        # 2. Coding signal (Code fence ``` or explicit code keywords/extensions)
        if "```" in task_description:
            return {
                "matched_stage": "stage1",
                "matched_signal": "Code fence (```) block detected",
                "task_type": "coding",
                "selected_model": settings.CODER_MODEL,
                "confidence": 1.0
            }

        for ext in STAGE1_CODE_EXTENSIONS:
            if re.search(r'\b' + re.escape(ext) + r'\b', text_lower) or f" {ext}" in text_lower:
                return {
                    "matched_stage": "stage1",
                    "matched_signal": f"Code file extension signal '{ext}'",
                    "task_type": "coding",
                    "selected_model": settings.CODER_MODEL,
                    "confidence": 0.98
                }

        for kw in STAGE1_CODE_KEYWORDS:
            if kw in text_lower:
                return {
                    "matched_stage": "stage1",
                    "matched_signal": f"Deterministic code keyword '{kw}'",
                    "task_type": "coding",
                    "selected_model": settings.CODER_MODEL,
                    "confidence": 0.95
                }

        # 3. General + RAG Document QA signal
        for kw in STAGE1_DOC_KEYWORDS:
            if kw in text_lower:
                return {
                    "matched_stage": "stage1",
                    "matched_signal": f"General document/SOP keyword '{kw}'",
                    "task_type": "document_summary",
                    "selected_model": settings.GENERAL_MODEL,
                    "confidence": 0.95
                }

        # Clear signal not found -> proceed to Stage 2
        return None

    @staticmethod
    def _evaluate_stage2(task_description: str) -> Dict[str, Any]:
        """Stage 2: LLM Tie-breaker call to GENERAL_MODEL forcing JSON output."""
        general_model = settings.GENERAL_MODEL
        ollama_url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"

        prompt = f"""You are a precise task classifier. Classify the user prompt into exactly ONE task type:
- "coding": for programming, debugging, algorithms, syntax errors, scripts
- "document_summary": for SOPs, manuals, policy reports, approvals, technical text summaries
- "vision": for images, visual schematics, drawings, OCR
- "general_agentic": for multi-step reasoning, general queries, general tasks

Respond strictly with valid JSON only in this exact format:
{{"task_type": "coding|document_summary|vision|general_agentic", "confidence": 0.9}}

USER PROMPT: {task_description[:300]}
JSON:"""

        payload = {
            "model": general_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.0
            }
        }

        task_type = "general_agentic"
        confidence = 0.70
        matched_signal = f"LLM Tie-Breaker fallback ({general_model})"

        try:
            with httpx.Client(timeout=6.0) as client:
                resp = client.post(ollama_url, json=payload)
                if resp.status_code == 200:
                    raw_text = resp.json().get("response", "").strip()
                    # JSON parsing with regex extraction fallback
                    json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        tt = parsed.get("task_type", "").lower()
                        conf = float(parsed.get("confidence", 0.85))
                        if tt in ["coding", "document_summary", "vision", "general_agentic"]:
                            task_type = tt
                            confidence = min(max(conf, 0.5), 1.0)
                            matched_signal = f"Stage 2 LLM Tie-Breaker ({general_model} JSON)"
        except Exception as e:
            matched_signal = f"Stage 2 LLM Tie-Breaker (parse fallback: {str(e)})"

        # Model mapping
        if task_type == "coding":
            selected_model = settings.CODER_MODEL
        elif task_type == "vision":
            selected_model = settings.VISION_MODEL
        else:
            selected_model = settings.GENERAL_MODEL

        return {
            "matched_stage": "stage2",
            "matched_signal": matched_signal,
            "task_type": task_type,
            "selected_model": selected_model,
            "confidence": confidence
        }

    @classmethod
    def classify_and_route(cls, task_description: str, attached_files: List[str] = None, log_audit: bool = True) -> Dict[str, Any]:
        settings.reload()
        model_registry.reload()

        # Stage 1: Deterministic evaluation
        decision = cls._evaluate_stage1(task_description, attached_files=attached_files)
        
        # Stage 2: LLM Tie-breaker if Stage 1 is ambiguous
        if not decision:
            decision = cls._evaluate_stage2(task_description)

        input_summary = task_description[:80].replace("\n", " ")
        reason = f"[{decision['matched_stage'].upper()}] Signal: '{decision['matched_signal']}' -> Selected {decision['task_type']} model: {decision['selected_model']} (Conf: {decision['confidence']})"
        decision["reason"] = reason
        decision["input_summary"] = input_summary
        decision["matched_keywords"] = [decision["matched_signal"]]

        if log_audit:
            audit_logger.log_event(
                action="TASK_ROUTING_DECISION",
                resource=decision["selected_model"],
                status="ROUTED",
                details={
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "input_summary": input_summary,
                    "matched_stage": decision["matched_stage"],
                    "matched_signal": decision["matched_signal"],
                    "chosen_model": decision["selected_model"],
                    "task_type": decision["task_type"],
                    "confidence": decision["confidence"],
                    "reason": reason
                }
            )

        return decision

model_router = ModelRouter()
