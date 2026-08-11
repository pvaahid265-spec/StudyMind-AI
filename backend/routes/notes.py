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

from bson import ObjectId

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
# HELPERS
# =====================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()


def serialize_note(note: dict) -> dict:

    if "_id" in note:

        note["_id"] = str(
            note["_id"]
        )

    if isinstance(
        note.get("uploaded_at"),
        datetime
    ):

        uploaded_at = note["uploaded_at"]

        if uploaded_at.tzinfo is None:

            uploaded_at = uploaded_at.replace(
                tzinfo=timezone.utc
            )

        note["uploaded_at"] = (
            uploaded_at
            .astimezone(timezone.utc)
            .isoformat()
        )

    return note


def get_user(email: str):

    email = normalize_email(email)

    return users_collection.find_one({
        "email": email
    })


# =====================================================
# SAVE PDF
# =====================================================

def save_pdf(file: UploadFile):

    # -------------------------------------------------
    # FILE NAME
    # -------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )


    # -------------------------------------------------
    # EXTENSION
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
            "PDF SAVE ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save PDF file."
        )


    # -------------------------------------------------
    # FILE SIZE
    # -------------------------------------------------

    try:

        file_size = os.path.getsize(
            path
        )

    except Exception as e:

        print(
            "FILE SIZE ERROR:",
            str(e)
        )

        file_size = 0


    if file_size == 0:

        if os.path.exists(path):

            os.remove(path)

        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty."
        )


    if file_size > MAX_FILE_SIZE:

        if os.path.exists(path):

            os.remove(path)

        raise HTTPException(
            status_code=400,
            detail="PDF file size must be less than 10 MB."
        )


    # -------------------------------------------------
    # PDF HEADER
    # -------------------------------------------------

    try:

        with open(
            path,
            "rb"
        ) as f:

            header = f.read(10)

    except Exception as e:

        print(
            "PDF HEADER ERROR:",
            str(e)
        )

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

def get_pdf_text(path: str):

    try:

        text = extract_text(
            path
        )

    except Exception as e:

        print(
            "PDF EXTRACTION ERROR:",
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
    email: str,
    field: str
):

    try:

        users_collection.update_one(

            {
                "email": normalize_email(
                    email
                )
            },

            {
                "$inc": {
                    field: 1
                }
            }

        )

    except Exception as e:

        print(
            "USER STAT UPDATE ERROR:",
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

        # =================================================
        # EMAIL
        # =================================================

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )


        email = normalize_email(
            email
        )


        # =================================================
        # USER CHECK
        # =================================================

        user = get_user(
            email
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )


        # =================================================
        # SAVE PDF
        # =================================================

        path = save_pdf(
            file
        )


        # =================================================
        # EXTRACT TEXT
        # =================================================

        text = get_pdf_text(
            path
        )


        # =================================================
        # LIMIT TEXT
        # =================================================

        study_material = text[:12000]


        # =================================================
        # GENERATE SUMMARY
        # =================================================

        try:

            summary = generate_summary(
                study_material
            )

        except Exception as e:

            print(
                "AI SUMMARY ERROR:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail="Unable to generate AI summary."
            )


        # =================================================
        # SUMMARY CHECK
        # =================================================

        if (
            summary is None
            or not str(summary).strip()
        ):

            raise HTTPException(
                status_code=500,
                detail="AI could not generate a summary."
            )


        summary = str(
            summary
        )


        # =================================================
        # SAVE NOTE
        # =================================================

        try:

            result = notes_collection.insert_one({

                "user_id": email,

                "email": email,

                "filename": file.filename,

                "summary": summary,

                "favorite": False,

                "uploaded_at":
                    datetime.now(
                        timezone.utc
                    ),

            })

        except Exception as e:

            print(
                "NOTE SAVE ERROR:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail="Summary generated, but note could not be saved."
            )


        # =================================================
        # UPDATE USER STAT
        # =================================================

        update_user_stat(
            email,
            "notes_uploaded"
        )


        # =================================================
        # SUCCESS
        # =================================================

        return {

            "success": True,

            "note_id":
                str(result.inserted_id),

            "filename":
                file.filename,

            "characters":
                len(text),

            "summary":
                summary,

            "favorite":
                False,

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

                os.remove(
                    path
                )

            except Exception as e:

                print(
                    "TEMPORARY PDF DELETE ERROR:",
                    str(e)
                )


# =====================================================
# GET ALL NOTES
# =====================================================

@router.get("/{email}")
async def get_notes(
    email: str
):

    try:

        # -------------------------------------------------
        # EMAIL
        # -------------------------------------------------

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )


        email = normalize_email(
            email
        )


        # -------------------------------------------------
        # USER
        # -------------------------------------------------

        user = get_user(
            email
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )


        # -------------------------------------------------
        # NOTES
        # -------------------------------------------------

        notes = list(

            notes_collection.find(

                {
                    "$or": [

                        {
                            "user_id": email
                        },

                        {
                            "email": email
                        }

                    ]
                },

                {
                    "_id": 1,
                    "user_id": 1,
                    "email": 1,
                    "filename": 1,
                    "summary": 1,
                    "favorite": 1,
                    "uploaded_at": 1,
                }

            ).sort(
                "uploaded_at",
                -1
            )

        )


        # -------------------------------------------------
        # SERIALIZE
        # -------------------------------------------------

        notes = [

            serialize_note(note)

            for note in notes

        ]


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success": True,

            "count": len(notes),

            "notes": notes,

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "GET NOTES ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch notes."
        )


# =====================================================
# GET FAVORITE NOTES
# =====================================================

@router.get("/favorites/{email}")
async def get_favorite_notes(
    email: str
):

    try:

        # -------------------------------------------------
        # EMAIL
        # -------------------------------------------------

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )


        email = normalize_email(
            email
        )


        # -------------------------------------------------
        # USER CHECK
        # -------------------------------------------------

        user = get_user(
            email
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )


        # -------------------------------------------------
        # FAVORITES
        # -------------------------------------------------

        favorites = list(

            notes_collection.find(

                {
                    "$and": [

                        {
                            "$or": [

                                {
                                    "user_id":
                                        email
                                },

                                {
                                    "email":
                                        email
                                }

                            ]
                        },

                        {
                            "favorite":
                                True
                        }

                    ]
                },

                {
                    "_id": 1,
                    "user_id": 1,
                    "email": 1,
                    "filename": 1,
                    "summary": 1,
                    "favorite": 1,
                    "uploaded_at": 1,
                }

            ).sort(
                "uploaded_at",
                -1
            )

        )


        # -------------------------------------------------
        # SERIALIZE
        # -------------------------------------------------

        favorites = [

            serialize_note(note)

            for note in favorites

        ]


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success": True,

            "count":
                len(favorites),

            "favorites":
                favorites,

            "notes":
                favorites,

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "GET FAVORITES ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch favorite notes."
        )


# =====================================================
# TOGGLE FAVORITE
# =====================================================

@router.put("/{note_id}/favorite")
async def toggle_favorite(
    note_id: str
):

    try:

        # -------------------------------------------------
        # OBJECT ID
        # -------------------------------------------------

        try:

            object_id = ObjectId(
                note_id
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid note ID."
            )


        # -------------------------------------------------
        # FIND NOTE
        # -------------------------------------------------

        note = notes_collection.find_one(
            {
                "_id": object_id
            }
        )


        if not note:

            raise HTTPException(
                status_code=404,
                detail="Note not found."
            )


        # -------------------------------------------------
        # TOGGLE
        # -------------------------------------------------

        current_value = bool(
            note.get(
                "favorite",
                False
            )
        )


        new_value = not current_value


        notes_collection.update_one(

            {
                "_id": object_id
            },

            {
                "$set": {
                    "favorite":
                        new_value
                }
            }

        )


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success": True,

            "note_id":
                note_id,

            "favorite":
                new_value,

            "message":
                (
                    "Note added to favorites."
                    if new_value
                    else
                    "Note removed from favorites."
                ),

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "TOGGLE FAVORITE ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to update favorite."
        )


# =====================================================
# DELETE NOTE
# =====================================================

@router.delete("/{note_id}")
async def delete_note(
    note_id: str
):

    try:

        # -------------------------------------------------
        # OBJECT ID
        # -------------------------------------------------

        try:

            object_id = ObjectId(
                note_id
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid note ID."
            )


        # -------------------------------------------------
        # DELETE
        # -------------------------------------------------

        result = notes_collection.delete_one(

            {
                "_id": object_id
            }

        )


        if result.deleted_count == 0:

            raise HTTPException(
                status_code=404,
                detail="Note not found."
            )


        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success": True,

            "message":
                "Note deleted successfully.",

            "note_id":
                note_id,

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "DELETE NOTE ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete note."
        )