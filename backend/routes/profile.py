from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import (
    users_collection,
    notes_collection,
    quiz_collection,
    chat_collection,
)

from datetime import (
    datetime,
    timezone
)

router = APIRouter()


# =========================================================
# PROFILE UPDATE MODEL
# =========================================================

class ProfileUpdate(BaseModel):
    name: str


# =========================================================
# HELPER
# =========================================================

def normalize_email(email: str):
    return email.strip().lower()


def format_datetime(value):

    if not value:
        return None

    if isinstance(value, str):
        return value

    if isinstance(value, datetime):

        if value.tzinfo is None:

            value = value.replace(
                tzinfo=timezone.utc
            )

        return value.isoformat()

    return None


def safe_int(
    value,
    default=0
):

    try:

        if value is None:
            return default

        return int(value)

    except (
        TypeError,
        ValueError
    ):

        return default


def safe_progress(value):

    progress = safe_int(
        value,
        0
    )

    return max(
        0,
        min(
            progress,
            100
        )
    )


# =========================================================
# CALCULATE QUIZ ACCURACY
# =========================================================

def calculate_quiz_accuracy(email):

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
                ],
                "score": {
                    "$exists": True
                }
            }
        )
    )

    total_correct = 0
    total_questions = 0

    for quiz in quizzes:

        score = safe_int(
            quiz.get(
                "score",
                0
            )
        )

        total = safe_int(
            quiz.get(
                "total_questions",
                quiz.get(
                    "total",
                    0
                )
            )
        )

        total_correct += score
        total_questions += total

    if total_questions == 0:
        return 0

    return round(
        (
            total_correct
            / total_questions
        ) * 100
    )


# =========================================================
# CALCULATE LEARNING PROGRESS
# =========================================================

def calculate_learning_progress(
    notes_count,
    quiz_count,
    chat_count,
    quiz_accuracy
):

    quiz_activity = min(
        quiz_count * 5,
        20
    )

    notes_score = min(
        notes_count * 2,
        10
    )

    chat_score = min(
        chat_count,
        10
    )

    progress = round(
        (quiz_accuracy * 0.60)
        + quiz_activity
        + notes_score
        + chat_score
    )

    return max(
        0,
        min(
            progress,
            100
        )
    )


# =========================================================
# BUILD PROFILE
# =========================================================

def build_profile(
    user,
    email
):

    if not user:
        return None

    # =====================================================
    # NOTES
    # =====================================================

    notes_count = notes_collection.count_documents(
        {
            "$or": [
                {
                    "user_id": email
                },
                {
                    "email": email
                }
            ]
        }
    )

    # =====================================================
    # QUIZZES
    # =====================================================

    quiz_count = quiz_collection.count_documents(
        {
            "$or": [
                {
                    "user_id": email
                },
                {
                    "email": email
                }
            ],
            "score": {
                "$exists": True
            }
        }
    )

    # =====================================================
    # CHATS
    # =====================================================

    chat_count = chat_collection.count_documents(
        {
            "$or": [
                {
                    "user_id": email
                },
                {
                    "email": email
                }
            ]
        }
    )

    # =====================================================
    # SUMMARIES
    # =====================================================

    summaries_count = notes_collection.count_documents(
        {
            "$or": [
                {
                    "user_id": email
                },
                {
                    "email": email
                }
            ],
            "summary": {
                "$exists": True,
                "$nin": [
                    None,
                    ""
                ]
            }
        }
    )

    # =====================================================
    # QUIZ ACCURACY
    # =====================================================

    quiz_accuracy = calculate_quiz_accuracy(
        email
    )

    # =====================================================
    # PROGRESS
    # =====================================================

    learning_progress = (
        calculate_learning_progress(
            notes_count,
            quiz_count,
            chat_count,
            quiz_accuracy
        )
    )

    # =====================================================
    # STREAK
    # =====================================================

    learning_streak = safe_int(
        user.get(
            "learning_streak",
            0
        )
    )

    # =====================================================
    # RETURN
    # =====================================================

    return {

        "name":
            user.get(
                "name",
                ""
            ),

        "email":
            user.get(
                "email",
                email
            ),

        "created_at":
            format_datetime(
                user.get(
                    "created_at"
                )
            ),

        "notes_uploaded":
            notes_count,

        "quizzes_completed":
            quiz_count,

        "ai_conversations":
            chat_count,

        "summaries":
            summaries_count,

        "learning_streak":
            learning_streak,

        "learning_progress":
            safe_progress(
                learning_progress
            ),

        "quiz_accuracy":
            quiz_accuracy
    }


# =========================================================
# GET PROFILE
# =========================================================

@router.get("/{email}")
def get_profile(
    email: str
):

    email = normalize_email(
        email
    )

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required."
        )

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

    profile = build_profile(
        user,
        email
    )

    return {

        "success": True,

        "profile":
            profile
    }


# =========================================================
# UPDATE PROFILE
# =========================================================

@router.put("/{email}")
def update_profile(
    email: str,
    data: ProfileUpdate
):

    email = normalize_email(
        email
    )

    new_name = data.name.strip()

    # =====================================================
    # VALIDATION
    # =====================================================

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required."
        )

    if not new_name:

        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty."
        )

    if len(new_name) < 2:

        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters."
        )

    if len(new_name) > 100:

        raise HTTPException(
            status_code=400,
            detail="Name cannot exceed 100 characters."
        )

    # =====================================================
    # FIND USER
    # =====================================================

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

    # =====================================================
    # UPDATE NAME
    # =====================================================

    result = users_collection.update_one(
        {
            "_id": user["_id"]
        },
        {
            "$set": {
                "name": new_name
            }
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # =====================================================
    # UPDATED USER
    # =====================================================

    updated_user = users_collection.find_one(
        {
            "_id": user["_id"]
        }
    )

    if not updated_user:

        raise HTTPException(
            status_code=404,
            detail="Updated user could not be retrieved."
        )

    profile = build_profile(
        updated_user,
        email
    )

    return {

        "success": True,

        "message":
            "Profile updated successfully.",

        "profile":
            profile
    }