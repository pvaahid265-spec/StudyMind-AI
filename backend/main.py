from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv()


# =====================================================
# ROUTES
# =====================================================

from routes.auth import router as auth_router
from routes.ai_routes import router as ai_router
from routes.quiz import router as quiz_router
from routes.notes import router as notes_router
from routes.dashboard import router as dashboard_router
from routes.activity import router as activity_router
from routes.analytics import router as analytics_router
from routes.profile import router as profile_router
from routes.notifications import router as notifications_router
from routes.settings import router as settings_router
from routes.chat import router as chat_router


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="StudyMind AI API",
    version="1.0.0",
    description="AI Powered Learning Platform Backend 🚀"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "success": True,
        "message": "StudyMind AI Backend Running 🚀"
    }


# =====================================================
# AUTH
# =====================================================

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)


# =====================================================
# PROFILE
# =====================================================

app.include_router(
    profile_router,
    prefix="/profile",
    tags=["Profile"]
)


# =====================================================
# SETTINGS
# =====================================================

app.include_router(
    settings_router,
    prefix="/settings",
    tags=["Settings"]
)


# =====================================================
# NOTIFICATIONS
# =====================================================

app.include_router(
    notifications_router,
    prefix="/notifications",
    tags=["Notifications"]
)


# =====================================================
# AI
# =====================================================

app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI"]
)


# =====================================================
# AI CHAT
#
# chat.py:
#
# POST /chat
# GET  /chat/history/{email}
#
# Final:
#
# POST /ai/chat
# GET  /ai/chat/history/{email}
# =====================================================

app.include_router(
    chat_router,
    prefix="/ai",
    tags=["AI Chat"]
)


# =====================================================
# QUIZ
#
# quiz.py:
#
# POST /quiz
# POST /quiz/result
# GET  /quiz/history/{email}
#
# Final:
#
# POST /ai/quiz
# POST /ai/quiz/result
# GET  /ai/quiz/history/{email}
# =====================================================

app.include_router(
    quiz_router,
    prefix="/ai",
    tags=["Quiz"]
)


# =====================================================
# NOTES
# =====================================================

app.include_router(
    notes_router,
    prefix="/notes",
    tags=["Notes"]
)


# =====================================================
# DASHBOARD
# =====================================================

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =====================================================
# ACTIVITY
# =====================================================

app.include_router(
    activity_router,
    prefix="/activity",
    tags=["Activity"]
)


# =====================================================
# ANALYTICS
# =====================================================

app.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Analytics"]
)


# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )