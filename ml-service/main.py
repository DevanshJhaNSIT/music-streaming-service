from fastapi import FastAPI
from fastapi import HTTPException
import pdfplumber
from pathlib import Path

app = FastAPI()

def extract_text(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

def get_keywords(text):
    words = {
        word.lower()
        for word in text.replace("/", " ").replace(",", " ").split()
        if word.isalpha() and len(word) > 2 and word.lower() not in ENGLISH_STOP_WORDS
    }
    return words

@app.post("/analyze")
async def analyze(data: dict):
    file_path = Path(data.get("filePath", ""))
    job_desc = data.get("jobDesc", "")

    if not file_path.is_file():
        raise HTTPException(status_code=400, detail="Uploaded resume file was not found.")

    resume_text = extract_text(file_path)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from resume.")

    if not job_desc:
        return {
            "score": 0,
            "missing_keywords": [],
            "suggestions": "Please provide a job description for better analysis."
        }

    # TF-IDF + similarity
    documents = [resume_text, job_desc]
    tfidf = TfidfVectorizer(stop_words="english").fit_transform(documents)
    similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]

    score = int(similarity * 100)
    resume_keywords = get_keywords(resume_text)
    job_keywords = get_keywords(job_desc)
    missing_keywords = sorted(job_keywords - resume_keywords)[:20]

    return {
        "score": score,
        "similarity": round(similarity, 2),
        "missing_keywords": missing_keywords,
        "suggestions": "Improve alignment with job description by adding relevant skills."
    }
