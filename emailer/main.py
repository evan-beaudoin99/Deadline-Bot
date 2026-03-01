import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from openai import OpenAI
from parser.data_extracter_single_pdf import summarize
import parser.api_auth as api_auth
import parser.db as db


def getEmailInfo() -> dict:
    if len(sys.argv) < 2:
        raise ValueError("Missing summarize payload argument")

    try: 
        emailInfo = json.loads(sys.argv[1])

        return emailInfo

    except json.JSONDecodeError:
        raise ValueError("Invalid JSON payload received")

# start = time.perf_counter()

API_KEY = api_auth.get_key()
client = OpenAI(api_key=f"{API_KEY}")



def main():
    try:
        emailInfo = getEmailInfo()

        user_id = emailInfo.get('user_id')
        pdf_id = emailInfo.get('pdf_id')
        course_id = emailInfo.get('course_id')
        course_metadata = emailInfo.get('course_metadata', {})

        if not user_id or not pdf_id or not course_id:
            raise ValueError("user_id, pdf_id, and course_id are required")

        pdf = db.get_pdf(pdf_id)
        extracted_summary = summarize(pdf, course_metadata, client)

        payload = {
            "success": True,
            "course_id": course_id,
            "summary": extracted_summary
        }

        print(json.dumps(payload))
    except Exception as error:
        print(f"Summary extraction failed: {error}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__" :
    main()
