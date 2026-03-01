from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl
import smtplib
from emailer_formatter import generate_week_content
from school_schedule_strategy import resolve_school_schedule
from pathlib import Path

import os
import sys
import json

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import parser.db as db

def send_email(recipient_email, body):
    # Retrieve credentials from Windows Environment Variables
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS") # Your 16-digit App Password

    if not smtp_user or not smtp_pass:
        print("Error: Email credentials not found in environment variables.")
        return

    # Create Message
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = recipient_email
    # Note: Subject is handled inside MIMEText if you want, but easier here:
    msg['Subject'] = body.split('\n')[0].replace("Subject: ", "")
    
    # Attach body (stripping the subject line from the actual text)
    actual_body = "\n".join(body.split('\n')[1:])
    msg.attach(MIMEText(actual_body, 'plain'))

    # Send via Gmail SMTP
    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

def parse_input_payload():
    if len(sys.argv) < 2:
        return None

    try:
        return json.loads(sys.argv[1])
    except json.JSONDecodeError:
        print("Error: Invalid JSON payload")
        return None


def main():
    payload = parse_input_payload() or {}

    user_id = payload.get("user_id")
    course_id = payload.get("course_id")
    week = int(payload.get("week", 1))
    semester = payload.get("semester", "winter")

    if not user_id:
        print("Error: user_id is required")
        return

    user_result = db.get_user_info(user_id)
    if user_result.get("status") != "success":
        print("Error: user not found")
        return

    user_data = user_result["data"]
    institution = user_data.get("institution", "")

    schedule_result = resolve_school_schedule(db, institution, semester)
    if schedule_result.get("status") != "success":
        print(schedule_result.get("error"))
        return

    schedule_payload = schedule_result["data"]

    if not course_id:
        user_courses_result = db.get_user_courses(user_id)
        if user_courses_result.get("status") != "success" or not user_courses_result.get("data"):
            print("Error: no courses found for user")
            return
        course_id = str(user_courses_result["data"][0])

    course_result = db.get_course_data(course_id)
    if course_result.get("status") != "success":
        print("Error: course not found")
        return

    course_data = course_result["data"]
    email_body = generate_week_content(schedule_payload, course_data, week)

    if schedule_payload.get("strategy") == "fallback":
        email_body += (
            f"\n\nNote: Using {schedule_payload.get('institution')} schedule "
            f"for {schedule_payload.get('requested_institution')} account."
        )

    send_to = user_data.get("email")
    if not send_to:
        print("Error: user has no email address")
        return

    send_email(send_to, email_body)


if __name__ == "__main__":
    main()
