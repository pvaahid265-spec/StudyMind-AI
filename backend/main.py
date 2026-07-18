from fastapi import FastAPI

app = FastAPI(
    title="StudyMind AI",
    description="AI-powered Study Assistant for Students",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to StudyMind AI 🚀"
    }

@app.get("/about")
def about():
    return {
        "project": "StudyMind AI",
        "version": "1.0.0",
        "developer": "Vaahid"
    }