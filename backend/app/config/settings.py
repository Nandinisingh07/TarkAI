import os
import json
from pathlib import Path

from app.config.model_registry import model_registry

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = Path(__file__).resolve().parent / "models.json"

def load_config():
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "ollama_base_url": "http://localhost:11434",
        "coder_keywords": [
            "code", "script", "python", "function", "debug", "error", "bug", "algorithm",
            "refactor", "sql", "html", "javascript", "css", "class", "programming",
            "syntax", "compile", "traceback", "exception"
        ]
    }

class Settings:
    def __init__(self):
        self._config = load_config()
    
    def reload(self):
        self._config = load_config()
        model_registry.reload()

    @property
    def OLLAMA_BASE_URL(self) -> str:
        return os.getenv("OLLAMA_BASE_URL", self._config.get("ollama_base_url", "http://localhost:11434"))

    @property
    def CODER_MODEL(self) -> str:
        return model_registry.CODING_MODEL

    @property
    def GENERAL_MODEL(self) -> str:
        return model_registry.GENERAL_MODEL

    @property
    def VISION_MODEL(self) -> str:
        return model_registry.VISION_MODEL

    @property
    def OCR_ENGINE(self) -> str:
        return model_registry.OCR_ENGINE

    @property
    def OBJECT_DETECTION_MODEL(self) -> str:
        return model_registry.OBJECT_DETECTION_MODEL

    @property
    def CONFIDENCE_THRESHOLD(self) -> float:
        return model_registry.CONFIDENCE_THRESHOLD

    @property
    def CODER_KEYWORDS(self) -> list:
        return self._config.get("coder_keywords", [])

    @property
    def SANDBOX_DIR(self) -> Path:
        p = BASE_DIR / "data" / "sandbox"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def KNOWLEDGE_BASE_DIR(self) -> Path:
        p = BASE_DIR / "data" / "knowledge_base"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def OUTPUTS_DIR(self) -> Path:
        p = BASE_DIR / "outputs"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def UPLOADS_DIR(self) -> Path:
        p = BASE_DIR / "uploads"
        p.mkdir(parents=True, exist_ok=True)
        return p

settings = Settings()

