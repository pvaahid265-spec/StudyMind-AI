from datetime import datetime
from pydantic import BaseModel


class ChatHistory(BaseModel):

    email: str

    question: str

    answer: str

    created_at: datetime = datetime.now()