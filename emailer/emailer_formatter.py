import sys
from datetime import datetime

# content = sys.argv[1] if len(sys.argv) > 1 else '6965846a82ece9ce554e0606'


def get_items_in_range(items, start, end, date_key):
    """Filters list of dicts based on a date range."""
    valid_items = []
    for item in items:
        date_str = item.get(date_key)
        if not date_str:
            continue
        try:
            item_date = datetime.strptime(date_str, "%Y-%m-%d")
        except Exception:
            # valid_items.append(item) # exam handler (since it is not a date)
            continue

        if start <= item_date <= end:
            valid_items.append(item)
    return valid_items

def format_item(item: dict, item_type: str):
    """Formats an individual item (test, assignment, tutorial) into a string line."""
    if item_type == "test":
        return f"• {item['test_name']} on {item['date']} (Grade: {item.get('grade_val', 'N/A')})"
    elif item_type == "assignment":
        return f"• {item['assignment_name']} due {item['due']} (Grade: {item.get('grade_val', 'N/A')})"
    elif item_type == "tutorial":
        return f"• {item['test_name']} on {item['date']}"
    return ""

def generate_week_content(school: dict, course_info: dict, week: int):
    # Calculate Date Range
    start_day = datetime.strptime(school["schedule"][week-1]["start"], "%Y-%m-%d")
    end_day = datetime.strptime(school["schedule"][week-1]["end"], "%Y-%m-%d")

    # Start Building the Email String
    lines = [
        f"Subject: Week {week} Update for {course_info['course_code']}",
        f"\nHello,",
        f"\nHere is your update for {course_info['course_name']} ({course_info['course_code']}).",
        f"Professor: {course_info['professor']} ({course_info['professor_email']})",
        "\n" + "="*30
    ]

    # Process Assignments
    assignments = get_items_in_range(course_info["dates"].get("assignments", []), start_day, end_day, "due")
    lines.append("\nASSIGNMENTS DUE THIS WEEK:")
    lines.extend([format_item(a, "assignment") for a in assignments] if assignments else ["  No assignments due."])

    # Process Tests
    tests = get_items_in_range(course_info["dates"].get("tests", []), start_day, end_day, "date")
    lines.append("\nTESTS THIS WEEK:")
    lines.extend([format_item(t, "test") for t in tests] if tests else ["  No tests scheduled."])

    # Process Tutorials
    tutorials = get_items_in_range(course_info["dates"].get("tutorials", []), start_day, end_day, "date")
    lines.append("\nTUTORIALS THIS WEEK:")
    lines.extend([format_item(t, "tutorial") for t in tutorials] if tutorials else ["  No tutorials scheduled."])

    lines.append("\n" + "="*30)
    lines.append("\nGood luck with your studies!")
    
    return "\n".join(lines)

