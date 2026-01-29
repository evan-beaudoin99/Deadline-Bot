from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl
import smtplib
from emailer_formatter import generate_week_content

import os
import sys

helpers_path = os.path.join(os.path.dirname(__file__), '../parser')
sys.path.append(os.path.abspath(helpers_path))

import db

USER_ID = "6977adebf3132137c2ceedbe"
USER = db.get_user_info(USER_ID)["data"]
SEND_TO = USER["email"]

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

course_data = db.get_course_data("697a87cfa814a43fd2c1fbc1")["data"]
carleton_data = db.get_school("Carleton University")["data"]

week = 5 # test week

email_body = generate_week_content(carleton_data, course_data, week)

send_email(SEND_TO, email_body)
