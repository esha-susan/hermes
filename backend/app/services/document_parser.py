import PyPDF2
import docx
import io

def extract_text(file_bytes: bytes, filename: str) -> str:
  
    filename_lower = filename.lower()

    if filename_lower.endswith('.pdf'):
        return _parse_pdf(file_bytes)
    elif filename_lower.endswith('.docx'):
        return _parse_docx(file_bytes)
    elif filename_lower.endswith('.txt'):
        return file_bytes.decode('utf-8')
    else:
        raise ValueError(f"Unsupported file type: {filename}. Use PDF, DOCX, or TXT.")

def _parse_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    pages = [page.extract_text() for page in reader.pages]
    
    return '\n'.join(p for p in pages if p and p.strip())

def _parse_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    paragraphs = [para.text for para in doc.paragraphs]
    return '\n'.join(p for p in paragraphs if p and p.strip())