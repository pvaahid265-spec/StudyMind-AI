from fastapi import APIRouter
from database import notes_collection

router = APIRouter()


@router.get("/{email}")
def get_recent_activity(email: str):

    notes = list(
        notes_collection.find(
            {
                "user_id": email.lower()
            }
        )
        .sort("uploaded_at", -1)
    )

    activities = []
    seen = set()

    for note in notes:

        filename = note.get("filename", "Untitled Note")

        # Remove duplicate .pdf extension
        while filename.lower().endswith(".pdf.pdf"):
            filename = filename[:-4]

        # Avoid duplicate activities
        note_key = filename.lower().strip()

        if note_key in seen:
            continue

        seen.add(note_key)

        activities.append({
            "title": filename,
            "time": note.get("uploaded_at"),
            "type": "summary"
        })

        # Only show latest 5 unique activities
        if len(activities) >= 5:
            break

    return {
        "success": True,
        "activities": activities
    }