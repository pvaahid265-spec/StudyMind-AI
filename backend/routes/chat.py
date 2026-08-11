import os
import tempfile

from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
)

from database import (
    users_collection,
    chat_collection,
)

from utils.pdf_reader import extract_text
from utils.ai import ask_doubt


router = APIRouter()


# =====================================================
# CONFIG
# =====================================================

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_AI_TEXT = 12000


# =====================================================
# NORMALIZE EMAIL
# =====================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()


# =====================================================
# GET USER
# =====================================================

def get_user(email: str):

    email = normalize_email(email)

    return users_collection.find_one(
        {
            "email": email
        }
    )


# =====================================================
# READ PDF
# =====================================================

async def read_pdf(
    file: UploadFile
) -> str:

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
            detail="Only PDF files are supported."
        )


    # -------------------------------------------------
    # READ FILE
    # -------------------------------------------------

    try:

        file_bytes = await file.read()

    except Exception as e:

        print(
            "PDF READ ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=400,
            detail="Unable to read uploaded PDF."
        )


    # -------------------------------------------------
    # EMPTY FILE
    # -------------------------------------------------

    if not file_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty."
        )


    # -------------------------------------------------
    # SIZE CHECK
    # -------------------------------------------------

    if len(file_bytes) > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=400,
            detail="PDF file size must be less than 10 MB."
        )


    # -------------------------------------------------
    # PDF HEADER CHECK
    # -------------------------------------------------

    if not file_bytes.startswith(b"%PDF"):

        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )


    temp_path = None


    try:

        # =============================================
        # CREATE TEMP PDF
        # =============================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            temp_file.write(file_bytes)

            temp_path = temp_file.name


        # =============================================
        # EXTRACT TEXT
        # =============================================

        try:

            text = extract_text(
                temp_path
            )

        except Exception as extraction_error:

            print(
                "PRIMARY PDF EXTRACTION ERROR:",
                str(extraction_error)
            )

            text = None


        # =============================================
        # FALLBACK TO PYPDF
        # =============================================

        if not text or not text.strip():

            try:

                from pypdf import PdfReader

                reader = PdfReader(
                    temp_path
                )

                pages_text = []


                for page in reader.pages:

                    try:

                        page_text = page.extract_text()

                        if page_text:

                            pages_text.append(
                                page_text
                            )

                    except Exception as page_error:

                        print(
                            "PAGE EXTRACTION WARNING:",
                            str(page_error)
                        )

                        continue


                text = "\n".join(
                    pages_text
                )


            except Exception as fallback_error:

                print(
                    "PDF FALLBACK ERROR:",
                    str(fallback_error)
                )

                raise HTTPException(
                    status_code=400,
                    detail="Unable to extract text from PDF."
                )


        # =============================================
        # TEXT CHECK
        # =============================================

        if not text or not text.strip():

            raise HTTPException(
                status_code=400,
                detail="No readable text found in this PDF."
            )


        return text.strip()


    except HTTPException:

        raise


    except Exception as e:

        print(
            "PDF PROCESSING ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=400,
            detail="Unable to process PDF."
        )


    finally:

        # =============================================
        # DELETE TEMP FILE
        # =============================================

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            try:

                os.remove(
                    temp_path
                )

            except Exception as delete_error:

                print(
                    "TEMP PDF DELETE ERROR:",
                    str(delete_error)
                )


# =====================================================
# CHAT WITH AI
# =====================================================

@router.post("/chat")
async def chat_with_ai(

    file: UploadFile = File(...),

    question: str = Form(...),

    email: str = Form(...),

):

    try:

        # =================================================
        # EMAIL CHECK
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
        # QUESTION CHECK
        # =================================================

        if not question or not question.strip():

            raise HTTPException(
                status_code=400,
                detail="Question is required."
            )


        question = question.strip()


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
        # READ PDF
        # =================================================

        text = await read_pdf(
            file
        )


        # =================================================
        # LIMIT TEXT SENT TO AI
        # =================================================

        study_material = text[
            :MAX_AI_TEXT
        ]


        # =================================================
        # ASK AI
        # =================================================

        try:

            answer = ask_doubt(
                study_material,
                question
            )

        except Exception as e:

            print(
                "AI CHAT ERROR:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail="Unable to generate AI response."
            )


        # =================================================
        # ANSWER CHECK
        # =================================================

        if (
            answer is None
            or not str(answer).strip()
        ):

            raise HTTPException(
                status_code=500,
                detail="AI returned an empty response."
            )


        answer = str(
            answer
        ).strip()


        # =================================================
        # SINGLE TIMESTAMP
        # =================================================

        created_at = datetime.now(
            timezone.utc
        )


        # =================================================
        # SAVE CHAT HISTORY
        # =================================================

        chat_document = {

            "user_id": email,

            "email": email,

            "filename": file.filename,

            "question": question,

            "answer": answer,

            "created_at": created_at,

        }


        try:

            chat_collection.insert_one(
                chat_document
            )

        except Exception as e:

            print(
                "CHAT HISTORY SAVE ERROR:",
                str(e)
            )

            # Do not fail AI response
            # if only database history fails.


        # =================================================
        # UPDATE AI CHAT COUNT
        # =================================================

        try:

            users_collection.update_one(

                {
                    "email": email
                },

                {
                    "$inc": {
                        "ai_conversations": 1
                    }
                }

            )

        except Exception as e:

            print(
                "CHAT STAT UPDATE ERROR:",
                str(e)
            )


        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return {

            "success": True,

            "filename": file.filename,

            "characters": len(text),

            "question": question,

            "answer": answer,

            "created_at":
                created_at.isoformat(),

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "CHAT ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to process AI chat."
        )


# =====================================================
# GET CHAT HISTORY
# =====================================================

@router.get(
    "/chat/history/{email}"
)
async def get_chat_history(
    email: str
):

    try:

        # =================================================
        # EMAIL CHECK
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
        # FETCH HISTORY
        # =================================================

        chats = list(

            chat_collection.find(

                {
                    "$or": [

                        {
                            "user_id": email
                        },

                        {
                            "email": email
                        },

                    ]
                },

                {
                    "_id": 0
                }

            ).sort(
                "created_at",
                -1
            )

        )


        # =================================================
        # DATETIME CONVERSION
        # =================================================

        for chat in chats:

            created_at = chat.get(
                "created_at"
            )


            if isinstance(
                created_at,
                datetime
            ):

                if created_at.tzinfo is None:

                    created_at = created_at.replace(
                        tzinfo=timezone.utc
                    )


                chat["created_at"] = (
                    created_at
                    .astimezone(
                        timezone.utc
                    )
                    .isoformat()
                )


        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success": True,

            "count": len(chats),

            "chats": chats,

        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "CHAT HISTORY ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch chat history."
        )