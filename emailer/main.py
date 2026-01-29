

from openai import OpenAI
from data_extracter_single_pdf import summarize
import parser.api_auth as api_auth
import parser.db as db
import sys
import json


def getEmailInfo() -> dict:
    try: 
        # if len(sys.argv) < 1:
        #     print("PDF Not found")
        #     exit()
        # else:
        emailInfo = json.loads(sys.argv[1])

        return emailInfo

    except json.JSONDecodeError:
        print("Error: Invalid Json string received")

# start = time.perf_counter()

API_KEY = api_auth.get_key()

client = OpenAI(api_key=f"{API_KEY}")

student_section = "A"

# user = "evanbeaudoin"
# pdfs = db.get_pdfs(user)

# print("Main", pdf_id)

# pdf = db.get_pdf(pdf_id)



def main():

    emailInfo = getEmailInfo()

    user_id = emailInfo.get('user_id')
    pdf_id = emailInfo.get('pdf_id')

    pdf = db.get_pdf(pdf_id)

    data = summarize(pdf, student_section, client)

    if (data == -1):
        print("No PDFS")
        return
    
    db.save_course_data(user_id, data)

    # print("✅ Extraction complete! Results stored in database")
    # end = time.perf_counter()
    # print(f"Runtime: {end - start:.6f} seconds")

if __name__ == "__main__" :
    main()
