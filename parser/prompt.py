



def prompt_text(student_section, course_code, text): 
    
    return f"""
        You are an information extraction system.

        Your task is to extract structured academic deadline data from a university course outline.

        STUDENT SECTION:
        - The student belongs to section "{student_section}".
        - If deadlines differ by section, ONLY extract deadlines that apply to this section.
        - If a deadline does not apply to this section, omit it.
        - If multiple deadlines for any reason, seperate them by an 'or'

        OUTPUT REQUIREMENTS (STRICT):
        - Output ONLY valid JSON.
        - Do NOT include explanations, comments, or markdown.
        - Do NOT invent data.
        - If a field is unknown, use an empty string "".
        - If a list has no items, return an empty array [].
        - All dates MUST be in ISO format: YYYY-MM-DD.
        - Percentages MUST include the % symbol (e.g., "12.5%").

        OUTPUT JSON SCHEMA (DO NOT CHANGE KEYS OR STRUCTURE):

        {{
        "course_code": "{course_code}",
        "course_name": ""
        "professor": "",
        "professor_email": "",
        "dates": {{
            "assignments": [
            {{
                "assignment_name": "",
                "release": "",
                "due": "",
                "grade_val": ""
            }}
            ],
            "tests": [
            {{
                "test_name": "",
                "date": "",
                "grade_val": ""
            }}
            ],
            "tutorials": [
            {{
                "tutorial_name": "",
                "date": ""
            }}
            ]
        }}
        }}

        IMPORTANT RULES:
        - Preserve all key names exactly as shown.
        - Do not rename, add, or remove keys.
        - Do not return null — use empty strings or empty arrays instead.
        - If no dates are given for a particular category just make it an empty list
        - If grade values are not given/explicit try to infer based on other information given. (ex. 60%, 4 assignments = 15% per assignment)
        - For exams, the date is usually not given the course syllabus, but later on - for now just say TBD in April - add this for every course

        COURSE OUTLINE TEXT:
        {text}
        """