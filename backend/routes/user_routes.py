from fastapi import APIRouter
from models.user_model import User
from database.mongodb import db

router = APIRouter()


@router.post("/register")
def register_user(user: User):

    user_data = user.model_dump()

    db.users.insert_one(user_data)

    return {
        "message": "User Registered Successfully"
    }