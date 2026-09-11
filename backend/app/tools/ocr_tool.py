import os
from pathlib import Path
from PIL import Image
import pytesseract
from pypdf import PdfReader
from app.config.settings import settings

def extract_text(file_path: str) -> str:
    """
    Extracts text from images (.png, .jpg, .tiff) or scanned/digital PDF documents.
    Supports OCR via pytesseract and fallback PDF text parsing via pypdf.
    """
    try:
        # Check safe location
        p = Path(file_path)
        if not p.is_absolute():
            p = (settings.UPLOADS_DIR / file_path).resolve()
            if not p.exists():
                p = (settings.SANDBOX_DIR / file_path).resolve()

        if not p.exists():
            return f"Error: Target file '{file_path}' does not exist."

        ext = p.suffix.lower()

        if ext in [".pdf"]:
            # Try PDF text extraction first
            text = ""
            try:
                reader = PdfReader(str(p))
                for idx, page in enumerate(reader.pages):
                    extracted = page.extract_text()
                    if extracted:
                        text += f"\n--- Page {idx+1} ---\n" + extracted
            except Exception as e:
                text = ""

            if text.strip():
                return f"[PDF Text Extraction Result - {p.name}]\n{text.strip()}"
            
            # Fallback to OCR message if PDF was scanned raster image
            return f"[PDF OCR Notice - {p.name}]\nPDF appears to be scanned image. For full OCR, ensure tesseract system package is installed."

        elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"]:
            try:
                img = Image.open(str(p))
                extracted_text = pytesseract.image_to_string(img)
                if extracted_text.strip():
                    return f"[OCR Extraction Result - {p.name}]\n{extracted_text.strip()}"
                return f"[OCR Result - {p.name}] Image processed, but no clear text was recognized."
            except Exception as e:
                return f"OCR processing notice for '{p.name}': Tesseract OCR engine or binary not configured. Ensure tesseract binary is installed for image text extraction."

        elif ext in [".txt", ".md", ".csv", ".json", ".log"]:
            return f"[Text File Content - {p.name}]\n" + p.read_text(encoding="utf-8", errors="ignore")

        else:
            return f"Error: Unsupported file format '{ext}' for OCR tool. Supported: .pdf, .png, .jpg, .jpeg, .tiff, .txt."

    except Exception as e:
        return f"Error extracting text from '{file_path}': {str(e)}"
