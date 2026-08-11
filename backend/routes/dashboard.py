from fastapi import APIRouter
from database import (
    users_collection,
    notes_collection,
    quiz_collection,
    chat_collection,
)

from datetime import datetime, timezone

router = APIRouter()


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def normalize_email(email: str):
    return email.strip().lower()


def safe_int(value, default=0):
    try:
        if value is None:
            return default

        return int(value)

    except (TypeError, ValueError):
        return default


def safe_progress(value):
    progress = safe_int(value, 0)

    return max(
        0,
        min(progress, 100)
    )


def format_datetime(value):
    if not value:
        return ""

    if isinstance(value, str):
        return value

    if isinstance(value, datetime):

        if value.tzinfo is None:
            value = value.replace(
                tzinfo=timezone.utc
            )

        return value.isoformat()

    return str(value)


# =========================================================
# CALCULATE LEARNING PROGRESS
# =========================================================

def calculate_progress(
    notes_count,
    quiz_count,
    chat_count,
    quiz_accuracy=0
):
    """
    Unified learning progress calculation.

    Components:
    - Quiz performance
    - Quiz activity
    - Notes
    - AI chats
    """

    quiz_accuracy = safe_progress(
        quiz_accuracy
    )

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
        min(progress, 100)
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
                ]
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
# DASHBOARD STATS
# =========================================================

@router.get("/stats/{email}")
def get_dashboard_stats(email: str):

    # =====================================================
    # NORMALIZE EMAIL
    # =====================================================

    email = normalize_email(email)

    if not email:
        return {
            "success": False,
            "message": "Email is required."
        }

    # =====================================================
    # FIND USER
    # =====================================================

    user = users_collection.find_one(
        {
            "email": email
        }
    )

    if not user:
        return {
            "success": False,
            "message": "User not found."
        }

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

    favorite_notes_count = (
        notes_collection.count_documents(
            {
                "$or": [
                    {
                        "user_id": email
                    },
                    {
                        "email": email
                    }
                ],
                "favorite": True
            }
        )
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
    # AI CHATS
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
    # LEARNING PROGRESS
    # =====================================================

    learning_progress = calculate_progress(
        notes_count,
        quiz_count,
        chat_count,
        quiz_accuracy
    )

    # =====================================================
    # STREAK
    # =====================================================

    learning_streak = safe_int(
        user.get(
            "learning_streak",
            0
        ),
        0
    )

    learning_streak = max(
        0,
        learning_streak
    )

    # =====================================================
    # STUDY HOURS
    # =====================================================

    study_hours = safe_int(
        user.get(
            "study_hours",
            0
        ),
        0
    )

    # =====================================================
    # RECENT NOTES
    # =====================================================

    recent_notes = list(
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
            }
        )
        .sort(
            "uploaded_at",
            -1
        )
        .limit(5)
    )

    activities = []

    for note in recent_notes:

        uploaded_at = format_datetime(
            note.get(
                "uploaded_at",
                note.get(
                    "created_at",
                    ""
                )
            )
        )

        filename = note.get(
            "filename",
            "PDF"
        )

        activities.append(
            {
                "type": "note",

                "title": (
                    "Uploaded "
                    + filename
                ),

                "date": uploaded_at,

                "filename": filename
            }
        )

    # =====================================================
    # USER CREATED DATE
    # =====================================================

    created_at = format_datetime(
        user.get(
            "created_at",
            ""
        )
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "success": True,

        "user": {

            "name": user.get(
                "name",
                "User"
            ),

            "email": user.get(
                "email",
                email
            ),

            "joined": created_at,

            "created_at": created_at
        },

        "stats": {

            "notes_uploaded":
                notes_count,

            "favorites":
                favorite_notes_count,

            "quizzes_completed":
                quiz_count,

            "ai_conversations":
                chat_count,

            "summaries_created":
                summaries_count,

            "summaries":
                summaries_count,

            "learning_streak":
                learning_streak,

            "overall_progress":
                learning_progress,

            "learning_progress":
                learning_progress,

            "quiz_accuracy":
                quiz_accuracy,

            "study_hours":
                study_hours
        },

        "activities":
            activities
    }