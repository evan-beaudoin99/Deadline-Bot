from pymongo import MongoClient
from bson import ObjectId
import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["deadline"]
users = db["users"]
pdfs = db["pdfs"]
courses = db["courses"]
schools = db["schools"]

def get_pdf(pdf_id: str):

    doc = pdfs.find_one(
        {
            "_id": ObjectId(pdf_id)
        }
    )

    if not doc: 
        raise ValueError("PDF not found")
    return doc

def save_course_data(userId, course_data):
    try:
        course_data['uploadedBy'] = ObjectId(userId)

        existing = courses.find_one(
            {
                "course_code": course_data.get("course_code"),
                "section": course_data.get("section", "A"),
                "uploadedBy": ObjectId(userId)
            }
        )

        if existing:
            return existing["_id"]

        result = courses.insert_one(course_data)
        users.update_one({"_id": ObjectId(userId)}, {"$push": {"courses": result.inserted_id}})
        return result.inserted_id
      
    except Exception as e:
        return None


def update_course_summary(course_id, user_id, course_data):
    try:
        result = courses.update_one(
            {
                "_id": ObjectId(course_id),
                "uploadedBy": ObjectId(user_id)
            },
            {
                "$set": {
                    "course_name": course_data.get("course_name"),
                    "professor": course_data.get("professor"),
                    "professor_email": course_data.get("professor_email"),
                    "dates": course_data.get("dates", {}),
                    "summaryStatus": "completed",
                    "summaryCompletedAt": datetime.datetime.utcnow(),
                    "summaryError": None
                }
            }
        )

        return result.modified_count > 0
    except Exception as e:
        return False


def get_course_data(course_id):

    data = courses.find_one({"_id": ObjectId(course_id)})


    if not data:
        return {
            "status": "error",
            "data": None,
            "error": "Course not found"
        }
    else:
        return {
            "status": "success",
            "data": data,
            "error": None
        }

def get_school(school_name: str):

    school_data = schools.find_one({"institution": school_name})

    if not school_data:
        return {
            "status": "error",
            "data": None,
            "error": "School not found"
        }
    else:
        return {
            "status": "success",
            "data": school_data,
            "error": None
        }
    
def get_user_info(userId):
    user = users.find_one({"_id": ObjectId(userId)})

    if not user:
        return {
            "status": "error",
            "data": None,
            "error": "user not found"
        }
    else:
        return {
            "status": "success",
            "data": user,
            "error": None
        }


def get_user_courses(userId):
    user = users.find_one({"_id": ObjectId(userId)}, {"courses": 1})

    if not user:
        return {
            "status": "error",
            "data": None,
            "error": "user not found"
        }

    return {
        "status": "success",
        "data": user.get("courses", []),
        "error": None
    }