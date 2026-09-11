import re
from app.config.settings import settings

class TaskRouter:
    """
    Router module that auto-selects the appropriate local LLM based on task classification.
    Fully configurable via models.json / settings. Zero hardcoded model names.
    """

    @staticmethod
    def classify_task(task_description: str) -> dict:
        settings.reload()
        text_lower = task_description.lower()
        keywords = settings.CODER_KEYWORDS
        
        matched_keywords = []
        for kw in keywords:
            # Match whole words or standard code terms
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                matched_keywords.append(kw)
        
        # Check code snippets or curly braces / indents
        has_code_syntax = bool(re.search(r'(```|def |class |import |function |const |var |let |select |from |where )', text_lower))

        if matched_keywords or has_code_syntax:
            selected_model = settings.CODER_MODEL
            category = "coding"
            reason = f"Routed to Coder model ({selected_model}) due to matched keywords: {matched_keywords or ['code syntax pattern']}"
        else:
            selected_model = settings.GENERAL_MODEL
            category = "general"
            reason = f"Routed to General model ({selected_model}) for general reasoning & deliverable generation"

        return {
            "model": selected_model,
            "category": category,
            "reason": reason,
            "matched_keywords": matched_keywords
        }
