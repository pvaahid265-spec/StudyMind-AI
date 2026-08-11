from fastapi import APIRouter, HTTPException

from datetime import (
    datetime,
    timezone,
    timedelta
)

from database import (
    users_collection,
    quiz_collection,
    notes_collection,
    chat_collection,
)

router = APIRouter()


# =========================================================
# NORMALIZE EMAIL
# =========================================================

def normalize_email(email: str):
    return email.strip().lower()


# =========================================================
# GET USER
# =========================================================

def get_user(email: str):

    email = normalize_email(email)

    return users_collection.find_one(
        {
            "email": email
        }
    )


# =========================================================
# SERIALIZE DATETIME
# =========================================================

def serialize_datetime(value):

    if isinstance(value, datetime):

        if value.tzinfo is None:
            value = value.replace(
                tzinfo=timezone.utc
            )

        return value.astimezone(
            timezone.utc
        ).isoformat()

    return value


# =========================================================
# SAFE INT
# =========================================================

def safe_int(value, default=0):

    try:

        if value is None:
            return default

        return int(value)

    except (TypeError, ValueError):

        return default


# =========================================================
# SAFE FLOAT
# =========================================================

def safe_float(value, default=0):

    try:

        if value is None:
            return default

        return float(value)

    except (TypeError, ValueError):

        return default


# =========================================================
# GET QUIZ RESULTS
# =========================================================

def get_quiz_results(email: str):

    try:

        return list(
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
            .sort(
                "created_at",
                -1
            )
        )

    except Exception as e:

        print(
            "QUIZ RESULTS ERROR:",
            str(e)
        )

        return []


# =========================================================
# GET NOTES
# =========================================================

def get_notes(email: str):

    try:

        return list(
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
                    "_id": 0,
                    "uploaded_at": 1,
                    "created_at": 1,
                    "filename": 1
                }
            )
        )

    except Exception as e:

        print(
            "NOTES ACTIVITY ERROR:",
            str(e)
        )

        return []


# =========================================================
# GET CHATS
# =========================================================

def get_chats(email: str):

    try:

        return list(
            chat_collection.find(
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
                    "_id": 0,
                    "created_at": 1,
                    "filename": 1
                }
            )
        )

    except Exception as e:

        print(
            "CHAT ACTIVITY ERROR:",
            str(e)
        )

        return []


# =========================================================
# GET DOCUMENT DATETIME
# =========================================================

def get_document_datetime(
    document,
    *fields
):

    for field in fields:

        value = document.get(
            field
        )

        if isinstance(
            value,
            datetime
        ):

            if value.tzinfo is None:

                value = value.replace(
                    tzinfo=timezone.utc
                )

            return value.astimezone(
                timezone.utc
            )

    return None


# =========================================================
# BUILD WEEKLY DATA
# =========================================================

def build_weekly_data(email: str):

    now = datetime.now(
        timezone.utc
    )

    notes = get_notes(
        email
    )

    chats = get_chats(
        email
    )

    quizzes = get_quiz_results(
        email
    )

    weekly = []

    # =====================================================
    # LAST 7 DAYS
    # =====================================================

    for days_ago in range(
        6,
        -1,
        -1
    ):

        current_date = (
            now.date()
            - timedelta(
                days=days_ago
            )
        )

        notes_count = 0
        quizzes_count = 0
        chats_count = 0

        # =================================================
        # NOTES
        # =================================================

        for note in notes:

            created_at = get_document_datetime(
                note,
                "uploaded_at",
                "created_at"
            )

            if (
                created_at
                and created_at.date()
                == current_date
            ):

                notes_count += 1

        # =================================================
        # QUIZZES
        # =================================================

        for quiz in quizzes:

            created_at = get_document_datetime(
                quiz,
                "created_at",
                "completed_at",
                "submitted_at"
            )

            if (
                created_at
                and created_at.date()
                == current_date
            ):

                quizzes_count += 1

        # =================================================
        # CHATS
        # =================================================

        for chat in chats:

            created_at = get_document_datetime(
                chat,
                "created_at"
            )

            if (
                created_at
                and created_at.date()
                == current_date
            ):

                chats_count += 1

        # =================================================
        # TOTAL STUDY ACTIVITY
        # =================================================

        study_total = (
            notes_count
            + quizzes_count
            + chats_count
        )

        weekly.append(
            {
                "date":
                    current_date.isoformat(),

                "day":
                    current_date.strftime(
                        "%a"
                    ),

                "notes":
                    notes_count,

                "quizzes":
                    quizzes_count,

                "chats":
                    chats_count,

                "study":
                    study_total
            }
        )

    return weekly


# =========================================================
# CALCULATE STREAK
# =========================================================

def calculate_learning_streak(
    email: str
):

    notes = get_notes(
        email
    )

    chats = get_chats(
        email
    )

    quizzes = get_quiz_results(
        email
    )

    activity_dates = set()

    # =====================================================
    # NOTES
    # =====================================================

    for note in notes:

        created_at = get_document_datetime(
            note,
            "uploaded_at",
            "created_at"
        )

        if created_at:

            activity_dates.add(
                created_at.date()
            )

    # =====================================================
    # CHATS
    # =====================================================

    for chat in chats:

        created_at = get_document_datetime(
            chat,
            "created_at"
        )

        if created_at:

            activity_dates.add(
                created_at.date()
            )

    # =====================================================
    # QUIZZES
    # =====================================================

    for quiz in quizzes:

        created_at = get_document_datetime(
            quiz,
            "created_at",
            "completed_at",
            "submitted_at"
        )

        if created_at:

            activity_dates.add(
                created_at.date()
            )

    if not activity_dates:
        return 0

    today = datetime.now(
        timezone.utc
    ).date()

    # =====================================================
    # TODAY NO ACTIVITY
    # =====================================================

    if today not in activity_dates:

        yesterday = (
            today
            - timedelta(days=1)
        )

        if yesterday not in activity_dates:
            return 0

        today = yesterday

    # =====================================================
    # COUNT CONSECUTIVE DAYS
    # =====================================================

    streak = 0

    current_day = today

    while current_day in activity_dates:

        streak += 1

        current_day -= timedelta(
            days=1
        )

    return streak


# =========================================================
# ACHIEVEMENTS
# =========================================================

def build_achievements(
    total_notes,
    total_quizzes,
    total_chats,
    streak,
    best_score
):

    achievements = [

        {
            "id": "first-note",
            "icon": "📚",
            "title": "First Note",
            "description":
                "Upload your first study note.",
            "unlocked":
                total_notes >= 1
        },

        {
            "id": "five-notes",
            "icon": "📖",
            "title": "Note Collector",
            "description":
                "Upload 5 study notes.",
            "unlocked":
                total_notes >= 5
        },

        {
            "id": "first-quiz",
            "icon": "🧠",
            "title": "Quiz Starter",
            "description":
                "Complete your first quiz.",
            "unlocked":
                total_quizzes >= 1
        },

        {
            "id": "five-quizzes",
            "icon": "🏆",
            "title": "Quiz Master",
            "description":
                "Complete 5 quizzes.",
            "unlocked":
                total_quizzes >= 5
        },

        {
            "id": "ai-student",
            "icon": "🤖",
            "title": "AI Learner",
            "description":
                "Have 5 AI tutor conversations.",
            "unlocked":
                total_chats >= 5
        },

        {
            "id": "streak-three",
            "icon": "🔥",
            "title": "3 Day Streak",
            "description":
                "Study for 3 consecutive days.",
            "unlocked":
                streak >= 3
        },

        {
            "id": "streak-seven",
            "icon": "⚡",
            "title": "7 Day Streak",
            "description":
                "Maintain a 7 day learning streak.",
            "unlocked":
                streak >= 7
        },

        {
            "id": "high-score",
            "icon": "🎯",
            "title": "High Scorer",
            "description":
                "Achieve a quiz score of 90% or higher.",
            "unlocked":
                best_score >= 90
        }
    ]

    unlocked = sum(
        1
        for item in achievements
        if item["unlocked"]
    )

    return (
        achievements,
        unlocked,
        len(achievements)
    )


# =========================================================
# MAIN ANALYTICS
# =========================================================

@router.get("/{email}")
async def get_analytics(
    email: str
):

    try:

        # =================================================
        # VALIDATE EMAIL
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
        # USER
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
        # DATA
        # =================================================

        quiz_results = get_quiz_results(
            email
        )

        notes = get_notes(
            email
        )

        chats = get_chats(
            email
        )

        # =================================================
        # TOTALS
        # =================================================

        total_quizzes = len(
            quiz_results
        )

        total_notes = len(
            notes
        )

        total_chats = len(
            chats
        )

        # =================================================
        # FAVORITES
        # =================================================

        favorite_notes = (
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

        # =================================================
        # QUIZ STATS
        # =================================================

        total_correct = 0
        total_questions = 0

        percentages = []

        recent_quizzes = []

        for result in quiz_results:

            score = safe_int(
                result.get(
                    "score",
                    0
                )
            )

            total = safe_int(
                result.get(
                    "total_questions",
                    result.get(
                        "total",
                        0
                    )
                )
            )

            percentage = result.get(
                "percentage"
            )

            if percentage is None:

                if total > 0:

                    percentage = (
                        score
                        / total
                    ) * 100

                else:

                    percentage = 0

            percentage = round(
                safe_float(
                    percentage,
                    0
                )
            )

            total_correct += score

            total_questions += total

            percentages.append(
                percentage
            )

            title = (
                result.get("title")
                or result.get("quiz_title")
                or result.get("filename")
                or result.get("topic")
                or "AI Quiz"
            )

            recent_quizzes.append(
                {
                    "title":
                        str(title),

                    "score":
                        score,

                    "total":
                        total,

                    "total_questions":
                        total,

                    "percentage":
                        percentage,

                    "created_at":
                        serialize_datetime(
                            result.get(
                                "created_at",
                                result.get(
                                    "completed_at"
                                )
                            )
                        )
                }
            )

        # =================================================
        # AVERAGE
        # =================================================

        if percentages:

            average_quiz_score = round(
                sum(percentages)
                / len(percentages)
            )

        else:

            average_quiz_score = 0

        # =================================================
        # BEST
        # =================================================

        if percentages:

            best_quiz_score = max(
                percentages
            )

        else:

            best_quiz_score = 0

        # =================================================
        # ACCURACY
        # =================================================

        if total_questions > 0:

            quiz_accuracy = round(
                (
                    total_correct
                    / total_questions
                ) * 100
            )

        else:

            quiz_accuracy = 0

        # =================================================
        # STREAK
        # =================================================

        learning_streak = (
            calculate_learning_streak(
                email
            )
        )

        # =================================================
        # LEARNING PROGRESS
        # =================================================

        learning_progress = round(
            (quiz_accuracy * 0.60)
            + min(
                total_quizzes * 5,
                20
            )
            + min(
                total_notes * 2,
                10
            )
            + min(
                total_chats,
                10
            )
        )

        learning_progress = max(
            0,
            min(
                learning_progress,
                100
            )
        )

        # =================================================
        # LAST ACTIVITY
        # =================================================

        activities = []

        for note in notes:

            created_at = get_document_datetime(
                note,
                "uploaded_at",
                "created_at"
            )

            if created_at:

                activities.append(
                    {
                        "type":
                            "note",

                        "timestamp":
                            created_at
                    }
                )

        for chat in chats:

            created_at = get_document_datetime(
                chat,
                "created_at"
            )

            if created_at:

                activities.append(
                    {
                        "type":
                            "AI chat",

                        "timestamp":
                            created_at
                    }
                )

        for quiz in quiz_results:

            created_at = get_document_datetime(
                quiz,
                "created_at",
                "completed_at",
                "submitted_at"
            )

            if created_at:

                activities.append(
                    {
                        "type":
                            "quiz",

                        "timestamp":
                            created_at
                    }
                )

        activities.sort(
            key=lambda x: x["timestamp"],
            reverse=True
        )

        if activities:

            last_activity = {
                "type":
                    activities[0]["type"],

                "timestamp":
                    serialize_datetime(
                        activities[0]["timestamp"]
                    )
            }

        else:

            last_activity = None

        # =================================================
        # ACHIEVEMENTS
        # =================================================

        (
            achievements,
            unlocked_achievements,
            total_achievements
        ) = build_achievements(
            total_notes,
            total_quizzes,
            total_chats,
            learning_streak,
            best_quiz_score
        )

        # =================================================
        # WEEKLY
        # =================================================

        weekly = build_weekly_data(
            email
        )

        # =================================================
        # PERFORMANCE
        # =================================================

        if average_quiz_score >= 90:

            performance = "Excellent"

        elif average_quiz_score >= 75:

            performance = "Very Good"

        elif average_quiz_score >= 60:

            performance = "Good"

        elif average_quiz_score >= 40:

            performance = "Needs Improvement"

        else:

            performance = "Getting Started"

        # =================================================
        # ANALYTICS
        # =================================================

        analytics = {

            "total_notes":
                total_notes,

            "total_quizzes":
                total_quizzes,

            "total_chats":
                total_chats,

            "favorite_notes":
                favorite_notes,

            "learning_streak":
                learning_streak,

            "learning_progress":
                learning_progress,

            "quiz_accuracy":
                quiz_accuracy,

            "average_quiz_score":
                average_quiz_score,

            "best_quiz_score":
                best_quiz_score,

            "recent_quizzes":
                recent_quizzes[:10],

            "last_activity":
                last_activity,

            "achievements":
                achievements,

            "unlocked_achievements":
                unlocked_achievements,

            "total_achievements":
                total_achievements,

            "performance":
                performance,

            "last_updated":
                datetime.now(
                    timezone.utc
                ).isoformat()
        }

        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success": True,

            "email":
                email,

            "analytics":
                analytics,

            "weekly":
                weekly
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "ANALYTICS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch analytics."
        )


# =========================================================
# WEEKLY ANALYTICS
# =========================================================

@router.get("/weekly/{email}")
async def get_weekly_analytics(
    email: str
):

    try:

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )

        email = normalize_email(
            email
        )

        user = get_user(
            email
        )

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        weekly = build_weekly_data(
            email
        )

        return {

            "success": True,

            "email":
                email,

            "weekly":
                weekly
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "WEEKLY ANALYTICS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load weekly analytics."
        )


# =========================================================
# QUIZ ANALYTICS
# =========================================================

@router.get("/{email}/quiz")
async def get_quiz_analytics(
    email: str
):

    try:

        if not email or not email.strip():

            raise HTTPException(
                status_code=400,
                detail="Email is required."
            )

        email = normalize_email(
            email
        )

        user = get_user(
            email
        )

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        results = get_quiz_results(
            email
        )

        history = []

        for item in results:

            score = safe_int(
                item.get(
                    "score",
                    0
                )
            )

            total = safe_int(
                item.get(
                    "total_questions",
                    item.get(
                        "total",
                        0
                    )
                )
            )

            percentage = item.get(
                "percentage"
            )

            if percentage is None:

                if total > 0:

                    percentage = (
                        score
                        / total
                    ) * 100

                else:

                    percentage = 0

            percentage = round(
                safe_float(
                    percentage,
                    0
                )
            )

            title = (
                item.get("title")
                or item.get("quiz_title")
                or item.get("filename")
                or item.get("topic")
                or "AI Quiz"
            )

            history.append(
                {
                    "title":
                        str(title),

                    "score":
                        score,

                    "total":
                        total,

                    "total_questions":
                        total,

                    "percentage":
                        percentage,

                    "created_at":
                        serialize_datetime(
                            item.get(
                                "created_at",
                                item.get(
                                    "completed_at"
                                )
                            )
                        )
                }
            )

        percentages = [
            item["percentage"]
            for item in history
        ]

        if percentages:

            average = round(
                sum(percentages)
                / len(percentages)
            )

            highest = max(
                percentages
            )

        else:

            average = 0
            highest = 0

        return {

            "success": True,

            "total_quizzes":
                len(history),

            "average_percentage":
                average,

            "highest_percentage":
                highest,

            "history":
                history[:20]
        }

    except HTTPException:

        raise

    except Exception as e:

        print(
            "QUIZ ANALYTICS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to fetch quiz analytics."
        )