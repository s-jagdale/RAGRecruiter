"""
Resume parser — extracts plain text from an uploaded PDF or DOCX resume file.
This text is then passed to Granite for gap analysis / question generation.
"""

from pypdf import PdfReader
from docx import Document
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file's raw bytes."""
    reader = PdfReader(io.BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract all text from a DOCX file's raw bytes."""
    document = Document(io.BytesIO(file_bytes))
    text_parts = [paragraph.text for paragraph in document.paragraphs]
    return "\n".join(text_parts).strip()


def parse_resume(filename: str, file_bytes: bytes) -> str:
    """
    Detects file type from filename extension and extracts text accordingly.
    Raises ValueError for unsupported file types.
    """
    lower_name = filename.lower()

    if lower_name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif lower_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(
            f"Unsupported file type: {filename}. Only .pdf and .docx are supported."
        )