from fastapi import APIRouter, HTTPException
from models.user_model import LoginUser
from database.mongodb import db

router = APIRouter()


@router.post("/login")
def login_user(user: LoginUser):

    existing_user = db.users.find_one({
        "email": user.email
    })

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if existing_user["password"] != user.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    return {
        "message": "Login Successful",
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"]
        }
    }