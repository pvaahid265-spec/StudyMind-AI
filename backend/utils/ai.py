import os
import json

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


# =====================================================
# ENVIRONMENT
# =====================================================

OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)

if not OPENROUTER_API_KEY:
    print(
        "WARNING: OPENROUTER_API_KEY is not configured."
    )


# =====================================================
# OPENROUTER CLIENT
# =====================================================

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

        raise ValueError(
            "No text provided for summary."
        )

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

            raise ValueError(
                "No AI response received."
            )


        content = (
            response
            .choices[0]
            .message
            .content
        )


        if not content:

            raise ValueError(
                "AI returned empty summary."
            )


        return content.strip()


    except Exception as e:

        print(
            "OPENROUTER SUMMARY ERROR:",
            str(e)
        )

        raise


# =====================================================
# QUIZ
# =====================================================

def generate_quiz(text: str) -> str:

    if not text or not text.strip():

        raise ValueError(
            "No text provided for quiz."
        )


    try:

        response = client.chat.completions.create(

            model=MODEL,

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are an educational quiz generator. "
                        "Create exactly 5 multiple-choice questions "
                        "from the provided study material."
                    ),
                },

                {
                    "role": "user",
                    "content": f"""
Create exactly 5 multiple-choice questions from the study material below.

Return ONLY a valid JSON array.

Required format:

[
  {{
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Correct option"
  }}
]

Rules:

1. Exactly 5 questions.
2. Exactly 4 options for every question.
3. The answer must exactly match one of the four options.
4. Questions must be based only on the study material.
5. Do not add explanations.
6. Do not add markdown.
7. Do not use ```json.
8. Return only the JSON array.

STUDY MATERIAL:

{text[:6000]}
""",
                },

            ],

            temperature=0.3,

            max_tokens=1500,

        )


        # =================================================
        # DEBUG RAW RESPONSE
        # =================================================

        print(
            "OPENROUTER QUIZ RAW RESPONSE:",
            response
        )


        # =================================================
        # CHECK CHOICES
        # =================================================

        if not response.choices:

            raise ValueError(
                "OpenRouter returned no choices."
            )


        message = (
            response
            .choices[0]
            .message
        )


        # =================================================
        # GET CONTENT
        # =================================================

        content = message.content


        if not content:

            print(
                "QUIZ MESSAGE:",
                message
            )

            raise ValueError(
                "OpenRouter returned empty quiz content."
            )


        content = content.strip()


        # =================================================
        # REMOVE MARKDOWN
        # =================================================

        if content.startswith(
            "```json"
        ):

            content = content[7:]


        elif content.startswith(
            "```"
        ):

            content = content[3:]


        if content.endswith(
            "```"
        ):

            content = content[:-3]


        content = content.strip()


        # =================================================
        # PARSE JSON
        # =================================================

        try:

            quiz_data = json.loads(
                content
            )

        except json.JSONDecodeError as e:

            print(
                "QUIZ JSON PARSE ERROR:",
                str(e)
            )

            print(
                "QUIZ CONTENT:",
                content
            )

            raise ValueError(
                "AI returned invalid quiz JSON."
            )


        # =================================================
        # VALIDATE ARRAY
        # =================================================

        if not isinstance(
            quiz_data,
            list
        ):

            raise ValueError(
                "Quiz response is not a JSON array."
            )


        if len(quiz_data) != 5:

            raise ValueError(
                f"Expected 5 questions, "
                f"got {len(quiz_data)}."
            )


        # =================================================
        # VALIDATE QUESTIONS
        # =================================================

        for index, question in enumerate(
            quiz_data,
            start=1
        ):

            if not isinstance(
                question,
                dict
            ):

                raise ValueError(
                    f"Question {index} is invalid."
                )


            if not question.get(
                "question"
            ):

                raise ValueError(
                    f"Question {index} "
                    f"has no question text."
                )


            options = question.get(
                "options"
            )


            if not isinstance(
                options,
                list
            ):

                raise ValueError(
                    f"Question {index} "
                    f"options are invalid."
                )


            if len(options) != 4:

                raise ValueError(
                    f"Question {index} "
                    f"must have exactly 4 options."
                )


            answer = question.get(
                "answer"
            )


            if answer not in options:

                raise ValueError(
                    f"Question {index} "
                    f"answer does not match "
                    f"an option."
                )


        # =================================================
        # RETURN CLEAN JSON
        # =================================================

        return json.dumps(
            quiz_data,
            ensure_ascii=False
        )


    except Exception as e:

        print(
            "OPENROUTER QUIZ ERROR:",
            str(e)
        )

        raise


# =====================================================
# AI TUTOR
# =====================================================

def ask_doubt(
    context: str,
    question: str
) -> str:

    if not context or not context.strip():

        raise ValueError(
            "No study material provided."
        )


    if not question or not question.strip():

        raise ValueError(
            "No question provided."
        )


    try:

        response = client.chat.completions.create(

            model=MODEL,

            messages=[

                {
                    "role": "system",
                    "content": (
                        "You are StudyMind AI Tutor. "
                        "Answer student questions clearly "
                        "and simply. "
                        "Use the uploaded study material "
                        "as the primary source. "
                        "Do not confuse the study material "
                        "with the student's question. "
                        "If the answer is not present in "
                        "the material, say that clearly "
                        "instead of inventing facts."
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

            raise ValueError(
                "No AI response received."
            )


        content = (
            response
            .choices[0]
            .message
            .content
        )


        if not content:

            raise ValueError(
                "AI returned empty response."
            )


        return content.strip()


    except Exception as e:

        print(
            "OPENROUTER CHAT ERROR:",
            str(e)
        )

        raise