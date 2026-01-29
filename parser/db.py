from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017")
db = client["deadline"]
users = db["users"]
pdfs = db["pdfs"]
courses = db["courses"]
schools = db["schools"]


# Many
# def get_pdfs(user):
#     doc = users.find_one({"username": user}, {"pdfs": 1})

#     if not doc: 
#         print("PDF not found")
#         exit()
#     return doc["pdfs"]

# Single
def get_pdf(pdf_id: str):

    doc = pdfs.find_one(
        {
            "_id": ObjectId(pdf_id)
        }
    )

    if not doc: 
        print("PDF not found")
        exit()
    return doc


def save_course_data(userId, course_data):

    course_data['uploadedBy'] = userId

    try:
        result = courses.insert_one(course_data)
        users.update_one({"_id": ObjectId(userId)}, {"$push": {"courses": result.inserted_id}})
      
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    else:
        print("All operations completed successfully.")

def get_course_data(userId):

    # data = courses.find_one({"uploadedBy": userId})

    data = courses.find_one({"_id": ObjectId(userId)})


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