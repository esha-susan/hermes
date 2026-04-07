import PyPDF2
import docx
import io
import urllib.request
from html.parser import HTMLParser

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

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip_tags = {'script', 'style', 'nav', 'footer', 'header'}
        self.current_skip = False

    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.current_skip = True

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.current_skip = False

    def handle_data(self, data):
        if not self.current_skip and data.strip():
            self.text.append(data.strip())

def extract_from_url(url: str) -> str:
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    parser = TextExtractor()
    parser.feed(html)
    
    text = ' '.join(parser.text)
    
    return text[:8000]