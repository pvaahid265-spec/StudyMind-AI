from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from passlib.context import CryptContext

from database import users_collection


router = APIRouter()


# =====================================================
# PASSWORD ENCRYPTION
# =====================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =====================================================
# REQUEST MODELS
# =====================================================

class ChangePasswordRequest(BaseModel):
    email: str
    current_password: str
    new_password: str = Field(min_length=6)


class NotificationSettingsRequest(BaseModel):
    email: str
    enabled: bool


# =====================================================
# CHANGE PASSWORD
# =====================================================

@router.put("/password")
def change_password(data: ChangePasswordRequest):

    email = data.email.lower().strip()

    # Find user
    user = users_collection.find_one({
        "email": email
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Verify current password
    try:
        password_valid = pwd_context.verify(
            data.current_password,
            user["password"]
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Password verification failed"
        )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )

    # Prevent same password
    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    # Hash new password
    hashed_password = pwd_context.hash(
        data.new_password
    )

    # Update database
    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "password": hashed_password
            }
        }
    )

    return {
        "success": True,
        "message": "Password updated successfully 🔐"
    }


# =====================================================
# GET NOTIFICATION SETTINGS
# =====================================================

@router.get("/notifications/{email}")
def get_notification_settings(email: str):

    email = email.lower().strip()

    user = users_collection.find_one(
        {"email": email},
        {
            "notifications_enabled": 1
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "success": True,
        "notifications_enabled": user.get(
            "notifications_enabled",
            True
        )
    }


# =====================================================
# UPDATE NOTIFICATION SETTINGS
# =====================================================

@router.put("/notifications")
def update_notification_settings(
    data: NotificationSettingsRequest
):

    email = data.email.lower().strip()

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "notifications_enabled": data.enabled
            }
        }
    )

    return {
        "success": True,
        "notifications_enabled": data.enabled,
        "message": (
            "Notifications enabled 🔔"
            if data.enabled
            else "Notifications disabled 🔕"
        )
    }