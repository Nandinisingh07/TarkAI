from app.model_router import model_router

class TaskRouter:
    """
    Router module that auto-selects the appropriate local LLM based on task classification.
    Delegates to model_router.py (Two-Stage Hybrid Router).
    """

    @staticmethod
    def classify_task(task_description: str, attached_files: list = None) -> dict:
        decision = model_router.classify_and_route(task_description, attached_files=attached_files, log_audit=True)
        return {
            "model": decision["selected_model"],
            "category": decision["task_type"],
            "reason": decision["reason"],
            "matched_keywords": decision["matched_keywords"],
            "matched_stage": decision["matched_stage"],
            "confidence": decision["confidence"]
        }
