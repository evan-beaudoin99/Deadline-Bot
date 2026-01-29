
import pdfplumber
from io import BytesIO

def get_text(pdf_data):
    with pdfplumber.open(BytesIO(pdf_data)) as pdf:
        text_pages = []
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_pages.append(page_text)

    full_text = "\n".join(text_pages)
    return full_text