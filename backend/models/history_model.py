from pydantic import BaseModel

class History(BaseModel):
    user_email: str
    feature: str
    title: str
    content: str