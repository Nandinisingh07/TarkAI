import os
from pathlib import Path
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR = Path(__file__).resolve().parent

def parse_env_file(filepath: Path) -> Dict[str, str]:
    config = {}
    if not filepath.exists():
        return config
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    config[key.strip()] = val.strip().strip("'\"")
    except Exception as e:
        print(f"Error parsing env file {filepath}: {e}")
    return config

class ModelRegistry:
    """
    Centralized config-driven model registry for TarkAI.
    No model names may be hardcoded anywhere else in the codebase.
    Switch profiles with config + restart only, zero code changes.
    """
    def __init__(self):
        self._config: Dict[str, str] = {}
        self.load_active_profile()

    def load_active_profile(self):
        profile_env_name = os.getenv("TARKAI_PROFILE_ENV", "").strip()
        
        candidates = []
        if profile_env_name:
            candidates.append(Path(profile_env_name))
            candidates.append(BASE_DIR / profile_env_name)
            candidates.append(CONFIG_DIR / profile_env_name)
            
        # Check standard tier files in workspace root and config dir
        candidates.extend([
            BASE_DIR / ".env",
            BASE_DIR / "cpu_tier.env",
            CONFIG_DIR / "cpu_tier.env",
            BASE_DIR / "production_tier.env",
            CONFIG_DIR / "production_tier.env",
            BASE_DIR / "stretch_tier.env",
            CONFIG_DIR / "stretch_tier.env",
        ])

        target_file = None
        for cand in candidates:
            if cand.exists():
                target_file = cand
                break

        # Defaults if no file found
        loaded_vals = {
            "GENERAL_MODEL": "qwen3:4b-instruct-2507",
            "CODING_MODEL": "qwen2.5-coder:3b",
            "VISION_MODEL": "qwen3-vl:4b",
            "OCR_ENGINE": "PaddleOCR",
            "OBJECT_DETECTION_MODEL": "rf-detr",
            "CONFIDENCE_THRESHOLD": "0.8",
            "PROFILE_NAME": "CPU Demo (Default)"
        }

        if target_file and target_file.exists():
            file_vals = parse_env_file(target_file)
            loaded_vals.update(file_vals)
            loaded_vals["LOADED_FROM"] = str(target_file)

        # Allow OS env vars to override
        for key in ["GENERAL_MODEL", "CODING_MODEL", "VISION_MODEL", "OCR_ENGINE", "OBJECT_DETECTION_MODEL", "CONFIDENCE_THRESHOLD", "PROFILE_NAME"]:
            if os.getenv(key):
                loaded_vals[key] = os.getenv(key)

        self._config = loaded_vals

    def reload(self):
        self.load_active_profile()

    @property
    def GENERAL_MODEL(self) -> str:
        return self._config.get("GENERAL_MODEL", "qwen3:4b-instruct-2507")

    @property
    def CODING_MODEL(self) -> str:
        return self._config.get("CODING_MODEL", "qwen2.5-coder:3b")

    @property
    def VISION_MODEL(self) -> str:
        return self._config.get("VISION_MODEL", "qwen3-vl:4b")

    @property
    def OCR_ENGINE(self) -> str:
        return self._config.get("OCR_ENGINE", "PaddleOCR")

    @property
    def OBJECT_DETECTION_MODEL(self) -> str:
        return self._config.get("OBJECT_DETECTION_MODEL", "rf-detr")

    @property
    def CONFIDENCE_THRESHOLD(self) -> float:
        try:
            return float(self._config.get("CONFIDENCE_THRESHOLD", "0.8"))
        except ValueError:
            return 0.8

    @property
    def PROFILE_NAME(self) -> str:
        return self._config.get("PROFILE_NAME", "CPU Demo")

    @property
    def models_by_capability(self) -> Dict[str, str]:
        return {
            "code": self.CODING_MODEL,
            "coding": self.CODING_MODEL,
            "document_qa": self.GENERAL_MODEL,
            "document_summary": self.GENERAL_MODEL,
            "general_reasoning": self.GENERAL_MODEL,
            "vision_ocr": self.VISION_MODEL,
            "image_analysis": self.VISION_MODEL,
            "ocr": self.OCR_ENGINE,
            "spreadsheet": self.CODING_MODEL,
            "object_detection": self.OBJECT_DETECTION_MODEL
        }

    def get_model_by_capability(self, task_type: str) -> str:
        tt = str(task_type).lower().strip()
        caps = self.models_by_capability
        return caps.get(tt, self.GENERAL_MODEL)

    def get_summary(self) -> Dict[str, Any]:
        return {
            "profile_name": self.PROFILE_NAME,
            "general_model": self.GENERAL_MODEL,
            "coding_model": self.CODING_MODEL,
            "vision_model": self.VISION_MODEL,
            "ocr_engine": self.OCR_ENGINE,
            "object_detection_model": self.OBJECT_DETECTION_MODEL,
            "confidence_threshold": self.CONFIDENCE_THRESHOLD,
            "models_by_capability": self.models_by_capability,
            "loaded_from": self._config.get("LOADED_FROM", "default_internal")
        }

model_registry = ModelRegistry()

