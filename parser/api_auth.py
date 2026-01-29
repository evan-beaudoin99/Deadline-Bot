import os
from dotenv import load_dotenv

def get_key():
    load_dotenv()

    API_KEY = os.getenv("API_KEY")

    if not API_KEY:
        raise RuntimeError("API_KEY not set")
    
    return API_KEY

print(get_key())
