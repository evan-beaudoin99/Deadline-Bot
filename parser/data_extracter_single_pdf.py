import json
from get_text import get_text
from parser.prompt import prompt_text
     
def summarize(pdf, student_section, client):
    if pdf == {}:
        return -1

    course_code = pdf["filename"].replace(".pdf", "")
    text = get_text(pdf["data"])

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
        
    return course_json # success


