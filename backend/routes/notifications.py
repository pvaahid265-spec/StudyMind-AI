from fastapi import APIRouter, HTTPException
from database import notifications_collection
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter()


# =====================================
# Create Notification
# =====================================

@router.post("/create")
def create_notification(data: dict):

    if not data.get("user_id"):
        raise HTTPException(
            status_code=400,
            detail="User ID is required"
        )

    notification = {
        "user_id": data["user_id"].lower(),
        "title": data.get("title", "Notification"),
        "message": data.get("message", ""),
        "created_at": datetime.now(),
        "read": False,
    }

    result = notifications_collection.insert_one(notification)

    return {
        "success": True,
        "message": "Notification created successfully",
        "notification_id": str(result.inserted_id)
    }


# =====================================
# Get User Notifications
# =====================================

@router.get("/{email}")
def get_notifications(email: str):

    notifications = list(

        notifications_collection.find(
            {
                "user_id": email.lower()
            }
        ).sort("created_at", -1)

    )

    for item in notifications:
        item["_id"] = str(item["_id"])

    return {
        "success": True,
        "notifications": notifications
    }
    # =====================================
# Mark Notification as Read
# =====================================

@router.put("/read/{notification_id}")
def mark_as_read(notification_id: str):

    try:

        result = notifications_collection.update_one(
            {
                "_id": ObjectId(notification_id)
            },
            {
                "$set": {
                    "read": True
                }
            }
        )

    except InvalidId:

        raise HTTPException(
            status_code=400,
            detail="Invalid Notification ID"
        )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "success": True,
        "message": "Notification marked as read"
    }


# =====================================
# Delete Notification
# =====================================

@router.delete("/{notification_id}")
def delete_notification(notification_id: str):

    try:

        result = notifications_collection.delete_one(
            {
                "_id": ObjectId(notification_id)
            }
        )

    except InvalidId:

        raise HTTPException(
            status_code=400,
            detail="Invalid Notification ID"
        )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "success": True,
        "message": "Notification deleted successfully"
    }