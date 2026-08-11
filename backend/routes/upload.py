from fastapi import APIRouter, UploadFile, File
import os
import shutil

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload")
async def upload_notes(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "File Uploaded Successfully",
        "filename": file.filename
    }