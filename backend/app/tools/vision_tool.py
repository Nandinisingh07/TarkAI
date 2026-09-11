import base64
import httpx
from pathlib import Path
from app.config.settings import settings

def describe_image(file_path: str, prompt: str = "Describe this image in detail for industrial inspection.") -> str:
    """
    Analyzes and describes image contents using local air-gapped multimodal vision model (moondream2 via Ollama).
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

        with open(p, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

        vision_model = settings.VISION_MODEL
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"

        payload = {
            "model": vision_model,
            "prompt": prompt,
            "images": [encoded_string],
            "stream": False
        }

        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                description = data.get("response", "").strip()
                return f"[Vision Analysis - {p.name} using {vision_model}]\n{description}"
            else:
                return f"Vision API Error ({response.status_code}): {response.text}"

    except Exception as e:
        return f"Error in vision analysis: {str(e)}. Make sure Ollama is running and model '{settings.VISION_MODEL}' is pulled."
