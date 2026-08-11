import os
import json
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
    quiz_collection,
)

from utils.pdf_reader import extract_text
from utils.ai import generate_quiz


router = APIRouter()


# =====================================================
# CONFIG
# =====================================================

MAX_FILE_SIZE = 10 * 1024 * 1024


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

    return users_collection.find_one({
        "email": email
    })


# =====================================================
# READ PDF
# =====================================================

async def read_pdf(file: UploadFile) -> str:

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF file."
        )

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    try:

        file_bytes = await file.read()

    except Exception as e:

        print("PDF READ ERROR:", str(e))

        raise HTTPException(
            status_code=400,
            detail="Unable to read uploaded PDF."
        )

    if not file_bytes:

        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty."
        )

    if len(file_bytes) > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=400,
            detail="PDF file size must be less than 10 MB."
        )

    if not file_bytes.startswith(b"%PDF"):

        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:

            temp_file.write(file_bytes)
            temp_path = temp_file.name

        text = extract_text(temp_path)

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
            "PDF EXTRACTION ERROR:",
            str(e)
        )

        try:

            from pypdf import PdfReader

            reader = PdfReader(temp_path)

            pages = []

            for page in reader.pages:

                try:

                    page_text = page.extract_text()

                    if page_text:
                        pages.append(page_text)

                except Exception:
                    continue

            text = "\n".join(pages)

            if not text.strip():

                raise HTTPException(
                    status_code=400,
                    detail="No readable text found in this PDF."
                )

            return text.strip()

        except HTTPException:

            raise

        except Exception as fallback_error:

            print(
                "PDF FALLBACK ERROR:",
                str(fallback_error)
            )

            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from PDF."
            )

    finally:

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            try:
                os.remove(temp_path)
            except Exception:
                pass


# =====================================================
# GENERATE QUIZ
# =====================================================

@router.post("/quiz")
async def generate_pdf_quiz(

    file: UploadFile = File(...),

    email: str = Form(...),

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

        email = normalize_email(email)

        # -------------------------------------------------
        # USER
        # -------------------------------------------------

        user = get_user(email)

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # -------------------------------------------------
        # PDF
        # -------------------------------------------------

        text = await read_pdf(file)

        study_material = text[:8000]

        # -------------------------------------------------
        # AI QUIZ
        # -------------------------------------------------

        try:

            quiz = generate_quiz(
                study_material
            )

        except Exception as e:

            print(
                "QUIZ AI ERROR:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail="Unable to generate quiz."
            )

        # -------------------------------------------------
        # PARSE JSON
        # -------------------------------------------------

        if isinstance(quiz, str):

            quiz_text = quiz.strip()

            if quiz_text.startswith("```"):

                quiz_text = (
                    quiz_text
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

            try:

                quiz = json.loads(
                    quiz_text
                )

            except json.JSONDecodeError:

                print(
                    "INVALID QUIZ JSON:",
                    quiz_text
                )

                raise HTTPException(
                    status_code=500,
                    detail="AI returned invalid quiz format."
                )

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not isinstance(quiz, list):

            raise HTTPException(
                status_code=500,
                detail="Invalid quiz format."
            )

        if len(quiz) != 5:

            raise HTTPException(
                status_code=500,
                detail="AI must generate exactly 5 questions."
            )

        clean_quiz = []

        for index, question in enumerate(quiz):

            if not isinstance(
                question,
                dict
            ):

                raise HTTPException(
                    status_code=500,
                    detail="Invalid question format."
                )

            question_text = str(
                question.get(
                    "question",
                    ""
                )
            ).strip()

            options = question.get(
                "options",
                []
            )

            answer = str(
                question.get(
                    "answer",
                    ""
                )
            ).strip()

            if not question_text:

                raise HTTPException(
                    status_code=500,
                    detail=f"Question {index + 1} is empty."
                )

            if not isinstance(
                options,
                list
            ) or len(options) != 4:

                raise HTTPException(
                    status_code=500,
                    detail=f"Question {index + 1} must have exactly 4 options."
                )

            options = [
                str(option).strip()
                for option in options
            ]

            if answer not in options:

                raise HTTPException(
                    status_code=500,
                    detail=f"Invalid answer in question {index + 1}."
                )

            clean_quiz.append({

                "question": question_text,

                "options": options,

                "answer": answer,

            })

        # -------------------------------------------------
        # SAVE QUIZ HISTORY
        # -------------------------------------------------

        quiz_document = {

            "user_id": email,

            "email": email,

            "filename": file.filename,

            "quiz": clean_quiz,

            "created_at":
                datetime.now(
                    timezone.utc
                ),

        }

        result = quiz_collection.insert_one(
            quiz_document
        )

        # -------------------------------------------------
        # UPDATE USER STAT
        # -------------------------------------------------

        try:

            users_collection.update_one(

                {
                    "email": email
                },

                {
                    "$inc": {
                        "quizzes_generated": 1
                    }
                }

            )

        except Exception as e:

            print(
                "QUIZ STAT ERROR:",
                str(e)
            )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "success": True,

            "quiz_id": str(
                result.inserted_id
            ),

            "filename": file.filename,

            "characters": len(text),

            "quiz": clean_quiz,

        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "QUIZ ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to process quiz."
        )


# =====================================================
# SAVE QUIZ RESULT
# =====================================================

@router.post("/quiz/result")
async def save_quiz_result(

    email: str = Form(...),

    score: int = Form(...),

    total_questions: int = Form(...),

):

    try:

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )

        email = normalize_email(email)

        user = get_user(email)

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        if total_questions <= 0:

            raise HTTPException(
                status_code=400,
                detail="Invalid total questions."
            )

        if score < 0 or score > total_questions:

            raise HTTPException(
                status_code=400,
                detail="Invalid quiz score."
            )

        percentage = round(
            (score / total_questions) * 100
        )

        now = datetime.now(
            timezone.utc
        )

        result_document = {

            "user_id": email,

            "email": email,

            "score": score,

            "total_questions":
                total_questions,

            "percentage":
                percentage,

            "created_at": now,

        }

        quiz_collection.insert_one(
            result_document
        )

        # -------------------------------------------------
        # UPDATE USER
        # -------------------------------------------------

        try:

            users_collection.update_one(

                {
                    "email": email
                },

                {
                    "$inc": {
                        "quizzes_completed": 1
                    }
                }

            )

        except Exception as e:

            print(
                "QUIZ COMPLETED STAT ERROR:",
                str(e)
            )

        return {

            "success": True,

            "score": score,

            "total_questions":
                total_questions,

            "percentage":
                percentage,

            "created_at":
                now.isoformat(),

        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "QUIZ RESULT ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save quiz result."
        )


# =====================================================
# QUIZ HISTORY
# =====================================================

@router.get("/quiz/history/{email}")
async def get_quiz_history(
    email: str
):

    try:

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )

        email = normalize_email(email)

        user = get_user(email)

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        quizzes = list(

            quiz_collection.find(

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
                    "_id": 0
                }

            ).sort(
                "created_at",
                -1
            )

        )

        for item in quizzes:

            created_at = item.get(
                "created_at"
            )

            if isinstance(
                created_at,
                datetime
            ):

                if created_at.tzinfo is None:

                    created_at = (
                        created_at.replace(
                            tzinfo=timezone.utc
                        )
                    )

                item["created_at"] = (
                    created_at
                    .astimezone(
                        timezone.utc
                    )
                    .isoformat()
                )

        return {

            "success": True,

            "count": len(quizzes),

            "quizzes": quizzes,

        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "QUIZ HISTORY ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch quiz history."
        )