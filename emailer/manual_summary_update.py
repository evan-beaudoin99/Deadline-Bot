import argparse
import json
import sys
from pathlib import Path

from openai import OpenAI


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import parser.api_auth as api_auth
import parser.db as db
from parser.data_extracter_single_pdf import summarize


def parse_args():
    parser = argparse.ArgumentParser(
        description='Manually run PDF summary extraction and update a course document with extracted dates.'
    )

    parser.add_argument('--user-id', required=True, help='Mongo ObjectId of the user who owns the course')
    parser.add_argument('--course-id', required=True, help='Mongo ObjectId of the course document to update')
    parser.add_argument('--pdf-id', required=True, help='Mongo ObjectId of the PDF document to parse')
    parser.add_argument('--course-code', required=True, help='Course code used for prompt context, e.g. COMP3005')
    parser.add_argument('--course-name', default='', help='Optional course name fallback')
    parser.add_argument('--section', default='A', help='Course section used for extraction filtering')

    return parser.parse_args()


def build_summary_metadata(args):
    return {
        'course_code': args.course_code,
        'course_name': args.course_name,
        'section': args.section
    }


def main():
    args = parse_args()

    try:
        api_key = api_auth.get_key()
        client = OpenAI(api_key=f'{api_key}')

        pdf = db.get_pdf(args.pdf_id)
        extracted_summary = summarize(pdf, build_summary_metadata(args), client)

        updated = db.update_course_summary(args.course_id, args.user_id, extracted_summary)
        if not updated:
            raise RuntimeError('Database update failed: course not found or no fields changed')

        output = {
            'success': True,
            'course_id': args.course_id,
            'pdf_id': args.pdf_id,
            'user_id': args.user_id,
            'summary': extracted_summary,
            'dates_count': {
                'assignments': len(extracted_summary.get('dates', {}).get('assignments', [])),
                'tests': len(extracted_summary.get('dates', {}).get('tests', [])),
                'tutorials': len(extracted_summary.get('dates', {}).get('tutorials', []))
            }
        }

        print(json.dumps(output))
    except Exception as error:
        print(f'Manual summary update failed: {error}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
