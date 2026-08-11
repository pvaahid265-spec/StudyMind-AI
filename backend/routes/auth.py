from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timezone

from database import users_collection
from utils.auth import create_access_token


router = APIRouter()


# =========================================================
# PASSWORD ENCRYPTION
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================================================
# REQUEST MODELS
# =========================================================

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register(user: UserRegister):

    # -----------------------------------------------------
    # CLEAN INPUT
    # -----------------------------------------------------

    name = user.name.strip()
    email = str(user.email).lower().strip()
    password = user.password

    # -----------------------------------------------------
    # NAME VALIDATION
    # -----------------------------------------------------

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters."
        )

    # -----------------------------------------------------
    # PASSWORD VALIDATION
    # -----------------------------------------------------

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password is required."
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters."
        )

    # -----------------------------------------------------
    # CHECK EXISTING USER
    # -----------------------------------------------------

    existing_user = users_collection.find_one(
        {
            "email": email
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # -----------------------------------------------------
    # HASH PASSWORD
    # -----------------------------------------------------

    try:
        hashed_password = pwd_context.hash(
            password
        )

    except Exception as e:
        print(
            "Password Hash Error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to secure password."
        )

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password,

        # Dashboard statistics
        "notes_uploaded": 0,
        "quizzes_completed": 0,
        "ai_conversations": 0,
        "learning_streak": 0,
        "learning_progress": 0,

        # Other learning data
        "quiz_history": [],

        # Settings
        "notifications_enabled": True,

        # Profile
        "created_at": datetime.now(timezone.utc)
    }

    # -----------------------------------------------------
    # INSERT USER
    # -----------------------------------------------------

    try:
        result = users_collection.insert_one(
            new_user
        )

    except Exception as e:
        print(
            "User Registration Database Error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create account."
        )

    # -----------------------------------------------------
    # INSERT CHECK
    # -----------------------------------------------------

    if not result.inserted_id:
        raise HTTPException(
            status_code=500,
            detail="Unable to create account."
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Registration successful 🚀",
        "user": {
            "name": name,
            "email": email
        }
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(user: UserLogin):

    # -----------------------------------------------------
    # CLEAN INPUT
    # -----------------------------------------------------

    email = str(user.email).lower().strip()
    password = user.password

    # -----------------------------------------------------
    # PASSWORD VALIDATION
    # -----------------------------------------------------

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password is required."
        )

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    db_user = users_collection.find_one(
        {
            "email": email
        }
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # -----------------------------------------------------
    # STORED PASSWORD CHECK
    # -----------------------------------------------------

    stored_password = db_user.get(
        "password"
    )

    if not stored_password:
        raise HTTPException(
            status_code=500,
            detail="User password data is missing."
        )

    # -----------------------------------------------------
    # VERIFY PASSWORD
    # -----------------------------------------------------

    try:
        password_valid = pwd_context.verify(
            password,
            stored_password
        )

    except Exception as e:
        print(
            "Password Verification Error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Password verification failed."
        )

    # -----------------------------------------------------
    # INVALID PASSWORD
    # -----------------------------------------------------

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid password."
        )

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    try:
        token = create_access_token(
            {
                "email": db_user["email"]
            }
        )

    except Exception as e:
        print(
            "JWT Creation Error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create login session."
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Login successful 🚀",

        "token": token,

        "user": {
            "name": db_user.get(
                "name",
                "User"
            ),

            "email": db_user.get(
                "email",
                email
            )
        }
    }