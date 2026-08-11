from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
import google.generativeai as genai
import os


router = APIRouter()



# =========================
# Gemini Configuration
# =========================

API_KEY = os.getenv("GEMINI_API_KEY")


if not API_KEY:
    raise Exception(
        "GEMINI_API_KEY not found in environment"
    )


genai.configure(
    api_key=API_KEY
)


model = genai.GenerativeModel(
    "gemini-2.0-flash"
)





# =========================
# PDF Summary API
# =========================

@router.post("/summary")
async def generate_summary(
    file: UploadFile = File(...)
):

    try:

        # Check PDF

        if file.content_type != "application/pdf":

            raise HTTPException(
                status_code=400,
                detail="Only PDF files allowed"
            )



        # Read PDF

        contents = await file.read()



        with open(
            "temp.pdf",
            "wb"
        ) as f:

            f.write(contents)





        # Extract Text

        reader = PdfReader(
            "temp.pdf"
        )


        text = ""


        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:

                text += page_text





        if not text.strip():

            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )





        # Avoid huge token usage

        text = text[:12000]





        prompt = f"""

You are StudyMind AI, an expert study assistant.

Create:

1. Simple summary
2. Important concepts
3. Exam preparation points


Study Notes:

{text}

"""





        response = model.generate_content(
            prompt
        )



        return {

            "summary": response.text

        }





    except HTTPException as e:

        raise e



    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )