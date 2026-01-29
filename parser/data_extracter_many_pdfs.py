import json
from get_text import get_text
from parser.prompt import prompt_text
     
def summarize(pdfs, student_section, client):
  if len(pdfs) == 0:
    return -1
  
  for file in pdfs:
          courses_data = {"courses": []}

          course_code = file["filename"].replace(".pdf", "")
          text = get_text(file["data"])

          # Send to OpenAI
          prompt = prompt_text(student_section, course_code, text)


          response = client.responses.create(
              model="gpt-4.1",
              input=prompt
          )

          output = response.output_text.strip()
          
          try:
              course_json = json.loads(output)
          except json.JSONDecodeError:
              course_json = {"course_name": course_code, "dates": {"error": "Invalid JSON returned"}}

          courses_data["courses"].append(course_json)
      
  return courses_data # success


