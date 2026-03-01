import json

try:
    from .get_text import get_text
    from .prompt import prompt_text
except ImportError:
    from get_text import get_text
    from prompt import prompt_text


def _parse_json_output(output_text):
    stripped_output = (output_text or "").strip()

    try:
        return json.loads(stripped_output)
    except json.JSONDecodeError:
        start_index = stripped_output.find("{")
        end_index = stripped_output.rfind("}")

        if start_index == -1 or end_index == -1 or end_index <= start_index:
            raise ValueError("Model did not return a JSON object")

        return json.loads(stripped_output[start_index:end_index + 1])


def _safe_string(value):
    return "" if value is None else f"{value}".strip()


def _normalize_items(items, required_keys):
    if not isinstance(items, list):
        return []

    normalized_items = []
    for item in items:
        if not isinstance(item, dict):
            continue

        normalized_items.append({
            key: _safe_string(item.get(key, ""))
            for key in required_keys
        })

    return normalized_items


def _normalize_summary(raw_summary, course_metadata, course_code):
    if not isinstance(raw_summary, dict):
        raise ValueError("Model response is not a JSON object")

    dates = raw_summary.get("dates") if isinstance(raw_summary.get("dates"), dict) else {}

    normalized_summary = {
        "course_name": _safe_string(raw_summary.get("course_name"))
        or _safe_string(course_metadata.get("course_name"))
        or course_code,
        "professor": _safe_string(raw_summary.get("professor")),
        "professor_email": _safe_string(raw_summary.get("professor_email")),
        "dates": {
            "assignments": _normalize_items(
                dates.get("assignments"),
                ["assignment_name", "release", "due", "grade_val"]
            ),
            "tests": _normalize_items(
                dates.get("tests"),
                ["test_name", "date", "grade_val"]
            ),
            "tutorials": _normalize_items(
                dates.get("tutorials"),
                ["tutorial_name", "date"]
            )
        }
    }

    total_dates = (
        len(normalized_summary["dates"]["assignments"])
        + len(normalized_summary["dates"]["tests"])
        + len(normalized_summary["dates"]["tutorials"])
    )

    if total_dates == 0:
        raise ValueError("No date entries were extracted from the course document")

    return normalized_summary
     
def summarize(pdf, course_metadata, client):
    if not pdf:
        raise ValueError("PDF document not found")

    course_metadata = course_metadata or {}

    student_section = course_metadata.get("section") or "A"
    course_code = course_metadata.get("course_code") or pdf["filename"].replace(".pdf", "")
    text = get_text(pdf["data"])

    prompt = prompt_text(student_section, course_code, text)

    response = client.responses.create(
        model="gpt-4.1",
        input=prompt
    )

    output = response.output_text.strip()

    raw_summary = _parse_json_output(output)
    return _normalize_summary(raw_summary, course_metadata, course_code)


