CARLETON_INSTITUTION = "Carleton University"
DEFAULT_SEMESTER = "winter"


def _extract_schedule(school_data: dict, semester: str):
    semesters = school_data.get("semesters") if school_data else None
    if isinstance(semesters, dict):
        semester_data = semesters.get(semester.lower(), {})
        schedule = semester_data.get("schedule", [])
        if schedule:
            return schedule

    return school_data.get("schedule", []) if school_data else []


def resolve_school_schedule(db_module, requested_institution: str, semester: str = DEFAULT_SEMESTER):
    active_institution = CARLETON_INSTITUTION

    if requested_institution == active_institution:
        institution_to_use = requested_institution
        strategy = "active"
    else:
        institution_to_use = active_institution
        strategy = "fallback"

    school_result = db_module.get_school(institution_to_use)
    if school_result.get("status") != "success":
        return {
            "status": "error",
            "error": f"No schedule found for {institution_to_use}",
            "data": None
        }

    school_data = school_result.get("data", {})
    schedule = _extract_schedule(school_data, semester)

    return {
        "status": "success",
        "error": None,
        "data": {
            "institution": institution_to_use,
            "requested_institution": requested_institution,
            "strategy": strategy,
            "semester": semester.lower(),
            "schedule": schedule
        }
    }
