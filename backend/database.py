from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# ==============================
# MongoDB Connection
# ==============================

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception(
        "MongoDB URI not found in .env file"
    )

client = MongoClient(MONGO_URI)

# ==============================
# Database
# ==============================

db = client["studymind"]

# ==============================
# Collections
# ==============================

users_collection = db["users"]

notes_collection = db["notes"]

quiz_collection = db["quizzes"]

chat_collection = db["chats"]

# NEW
notifications_collection = db["notifications"]

print("✅ MongoDB Connected Successfully")