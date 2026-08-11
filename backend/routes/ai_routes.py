import os
import shutil
import uuid

from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Form,
)

from database import (
    users_collection,
    notes_collection,
)

from utils.pdf_reader import extract_text

from utils.ai import generate_summary


router = APIRouter()


# =====================================================
# CONFIG
# =====================================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


MAX_FILE_SIZE = 10 * 1024 * 1024


# =====================================================
# SAVE PDF
# =====================================================

def save_pdf(file):

    # -------------------------------------------------
    # FILE NAME CHECK
    # -------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )


    # -------------------------------------------------
    # EXTENSION CHECK
    # -------------------------------------------------

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )


    # -------------------------------------------------
    # UNIQUE FILE NAME
    # -------------------------------------------------

    filename = (
        str(uuid.uuid4())
        + "_"
        + file.filename
    )


    path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )


    # -------------------------------------------------
    # SAVE FILE
    # -------------------------------------------------

    try:

        with open(
            path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as e:

        print(
            "PDF Save Error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save PDF file."
        )


    # -------------------------------------------------
    # FILE SIZE CHECK
    # -------------------------------------------------

    try:

        file_size = os.path.getsize(path)

    except Exception:

        file_size = 0


    if file_size > MAX_FILE_SIZE:

        if os.path.exists(path):
            os.remove(path)

        raise HTTPException(
            status_code=400,
            detail="PDF file size must be less than 10 MB."
        )


    # -------------------------------------------------
    # PDF HEADER CHECK
    # -------------------------------------------------

    try:

        with open(
            path,
            "rb"
        ) as f:

            header = f.read(10)

    except Exception:

        if os.path.exists(path):
            os.remove(path)

        raise HTTPException(
            status_code=400,
            detail="Unable to validate PDF file."
        )


    if not header.startswith(b"%PDF"):

        if os.path.exists(path):
            os.remove(path)

        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )


    return path


# =====================================================
# GET PDF TEXT
# =====================================================

def get_pdf_text(path):

    try:

        text = extract_text(path)

    except Exception as e:

        print(
            "PDF Extraction Error:",
            str(e)
        )

        raise HTTPException(
            status_code=400,
            detail="Unable to extract text from PDF."
        )


    if not text or not text.strip():

        raise HTTPException(
            status_code=400,
            detail="No readable text found in this PDF."
        )


    return text.strip()


# =====================================================
# UPDATE USER STAT
# =====================================================

def update_user_stat(
    email,
    field
):

    try:

        users_collection.update_one(

            {
                "email": email.strip().lower()
            },

            {
                "$inc": {
                    field: 1
                }
            }
        )

    except Exception as e:

        print(
            "User Stat Update Error:",
            str(e)
        )


# =====================================================
# SUMMARY API
# =====================================================

@router.post("/summarize")
async def summarize_pdf(

    file: UploadFile = File(...),

    email: str = Form(...)

):

    path = None


    try:

        # -------------------------------------------------
        # EMAIL
        # -------------------------------------------------

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )


        email = email.strip().lower()


        # -------------------------------------------------
        # USER CHECK
        # -------------------------------------------------

        user = users_collection.find_one(
            {
                "email": email
            }
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )


        # -------------------------------------------------
        # SAVE PDF
        # -------------------------------------------------

        path = save_pdf(file)


        # -------------------------------------------------
        # EXTRACT TEXT
        # -------------------------------------------------

        text = get_pdf_text(path)


        # -------------------------------------------------
        # GENERATE SUMMARY
        # -------------------------------------------------

        summary = generate_summary(text)


        if not summary:

            raise HTTPException(
                status_code=500,
                detail="AI could not generate a summary."
            )


        # -------------------------------------------------
        # SAVE NOTE
        # -------------------------------------------------

        notes_collection.insert_one(

            {
                "user_id": email,

                "email": email,

                "filename": file.filename,

                "summary": summary,

                "favorite": False,

                "uploaded_at":
                    datetime.now(
                        timezone.utc
                    ),
            }

        )


        # -------------------------------------------------
        # UPDATE USER STAT
        # -------------------------------------------------

        update_user_stat(
            email,
            "notes_uploaded"
        )


        # -------------------------------------------------
        # SUCCESS
        # -------------------------------------------------

        return {

            "success": True,

            "filename": file.filename,

            "characters": len(text),

            "summary": summary,
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "SUMMARY ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate summary."
        )


    finally:

        if (
            path
            and os.path.exists(path)
        ):

            try:

                os.remove(path)

            except Exception as e:

                print(
                    "Temporary PDF Delete Error:",
                    str(e)
                )