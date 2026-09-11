import os
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = Path(__file__).resolve().parent / "models.json"

def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "coder_model": "qwen2.5-coder:1.5b",
        "general_model": "phi3:mini",
        "vision_model": "moondream2",
        "ollama_base_url": "http://localhost:11434",
        "coder_keywords": ["code", "script", "python", "function", "debug", "error", "bug", "sql"]
    }

class Settings:
    def __init__(self):
        self._config = load_config()
    
    def reload(self):
        self._config = load_config()

    @property
    def OLLAMA_BASE_URL(self) -> str:
        return os.getenv("OLLAMA_BASE_URL", self._config.get("ollama_base_url", "http://localhost:11434"))

    @property
    def CODER_MODEL(self) -> str:
        return os.getenv("CODER_MODEL", self._config.get("coder_model", "qwen2.5-coder:1.5b"))

    @property
    def GENERAL_MODEL(self) -> str:
        return os.getenv("GENERAL_MODEL", self._config.get("general_model", "phi3:mini"))

    @property
    def VISION_MODEL(self) -> str:
        return os.getenv("VISION_MODEL", self._config.get("vision_model", "moondream2"))

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
