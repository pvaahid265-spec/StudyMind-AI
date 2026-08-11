from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import certifi
import os

# Load .env from backend folder
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception("❌ MONGO_URI not found in .env file")

try:
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=30000
    )

    # Test connection
    client.admin.command("ping")

    print("✅ MongoDB Connected Successfully")

except Exception as e:
    print("❌ MongoDB Connection Failed")
    print(e)


db = client["studymind"]