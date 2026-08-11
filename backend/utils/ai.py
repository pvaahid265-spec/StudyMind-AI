import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY is not configured.")


client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
)


MODEL = "openai/gpt-oss-20b:free"


# =====================================================
# SUMMARY
# =====================================================

def generate_summary(text: str) -> str:

    if not text or not text.strip():
        raise ValueError("No text provided for summary.")

    try:

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful AI study assistant. "
                        "Summarize documents clearly and accurately "
                        "for students."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        "Summarize the following study material "
                        "into simple bullet points.\n\n"
                        f"{text[:8000]}"
                    ),
                },
            ],
            temperature=0.3,
        )

        if not response.choices:
            raise ValueError("No AI response received.")

        content = response.choices[0].message.content

        if not content:
            raise ValueError("AI returned empty summary.")

        return content.strip()

    except Exception as e:

        print("OPENROUTER SUMMARY ERROR:", str(e))

        raise


# =====================================================
# QUIZ
# =====================================================

def generate_quiz(text: str) -> str:

    if not text or not text.strip():
        raise ValueError("No text provided for quiz.")

    try:

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an educational quiz generator."
                    ),
                },
                {
                    "role": "user",
                    "content": f"""
Create exactly 5 multiple choice questions from the notes.

Return ONLY valid JSON.

Format:

[
  {{
    "question": "...",
    "options": [
      "...",
      "...",
      "...",
      "..."
    ],
    "answer": "..."
  }}
]

Rules:

- Exactly 5 questions.
- Exactly 4 options per question.
- Answer must exactly match one option.
- No explanations.
- No markdown.
- No ```json.
- Return only JSON.

Notes:

{text[:6000]}
""",
                },
            ],
            temperature=0.5,
        )

        if not response.choices:
            raise ValueError("No AI response received.")

        content = response.choices[0].message.content

        if not content:
            raise ValueError("AI returned empty quiz.")

        return content.strip()

    except Exception as e:

        print("OPENROUTER QUIZ ERROR:", str(e))

        raise


# =====================================================
# AI TUTOR
# =====================================================

def ask_doubt(
    context: str,
    question: str
) -> str:

    if not context or not context.strip():
        raise ValueError("No study material provided.")

    if not question or not question.strip():
        raise ValueError("No question provided.")

    try:

        response = client.chat.completions.create(

            model=MODEL,

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are StudyMind AI Tutor. "
                        "Answer student questions clearly and simply. "
                        "Use the uploaded study material as the primary "
                        "source. Do not confuse the study material with "
                        "the student's question. "
                        "If the answer is not present in the material, "
                        "say that clearly instead of inventing facts."
                    ),
                },

                {
                    "role": "user",
                    "content": f"""
STUDY MATERIAL:
{context[:12000]}

STUDENT QUESTION:
{question.strip()}

Answer the student's question directly.
Explain difficult concepts in simple language.
Use headings and bullet points when useful.
""",
                },
            ],

            temperature=0.4,
        )

        if not response.choices:
            raise ValueError("No AI response received.")

        content = response.choices[0].message.content

        if not content:
            raise ValueError("AI returned empty response.")

        return content.strip()

    except Exception as e:

        print("OPENROUTER CHAT ERROR:", str(e))

        raise