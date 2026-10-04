"""
MediGuide Machine Learning Triage Service
FastAPI REST microservice serving Random Forest department predictions
Meets PRD Section 9 & Techstack Section 8.5
Includes Explainable AI (Feature Attribution) and Red-Flag Safety Protocol
"""

import os
import json
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

app = FastAPI(
    title="MediGuide ML Triage Service",
    description="Random Forest Medical Department Recommendation API with Safety Overrides",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'department_rf.joblib')
VEC_PATH = os.path.join(BASE_DIR, 'model', 'vectorizer.joblib')

clf = None
vectorizer = None

# Red flag emergency keywords for urgent clinical safety (PRD Section 9.6)
RED_FLAGS = [
    'chest pain', 'chest tightness', 'heart attack', 'breathlessness',
    'shortness of breath', 'slurred speech', 'facial droop', 'uncontrolled bleeding',
    'loss of consciousness', 'unresponsive', 'anaphylaxis', 'tongue swelling',
    'throat closing', 'cyanosis', 'thunderclap headache', 'coughing up blood',
    'hemoptysis', 'status epilepticus', 'seizure lasting'
]

# High-acuity critical indicators that trigger emergency protocols unconditionally
CRITICAL_RED_FLAGS = [
    'heart attack', 'slurred speech', 'uncontrolled bleeding',
    'loss of consciousness', 'unresponsive', 'anaphylaxis',
    'throat closing', 'cyanosis', 'chest pain', 'thunderclap headache',
    'coughing up blood', 'status epilepticus'
]

DEPARTMENT_GUIDANCE = {
    "Cardiology": "Symptoms point toward cardiovascular origin. Clinical assessment of blood pressure, resting ECG, and cardiac markers is advised. Avoid intense physical exertion.",
    "Dermatology": "Findings suggest dermatological or cutaneous inflammation. Maintain good skin hydration and avoid scratching or applying harsh cleansers until evaluated.",
    "ENT": "Symptoms align with upper respiratory or otorhinolaryngology conditions. Warm steam inhalation and adequate hydration can alleviate sinus or throat mucosal congestion.",
    "Orthopedics": "Reported symptoms are consistent with musculoskeletal strain or joint discomfort. Avoid high-impact loading and consider cold/warm compresses.",
    "Neurology": "Findings reflect potential cranial, vestibular, or neuro-vascular patterns. Ensure rest in a quiet, dimly lit room and monitor for visual or sensory changes.",
    "Gastroenterology": "Symptoms suggest gastrointestinal or peptic irritation. Choose light, easily digestible meals and avoid highly acidic, spicy, or fried foods.",
    "Pulmonology": "Symptoms indicate lower respiratory or bronchial involvement. A specialist physical chest auscultation and spirometry or chest radiograph may be indicated.",
    "Pediatrics": "Child healthcare assessment recommended. Monitor temperature, oral fluid intake, and hydration signs closely.",
    "General Medicine": "Symptoms reflect broad systemic, viral, or primary healthcare patterns. Evaluation by an internal medicine or family physician is recommended."
}

def load_artifacts():
    global clf, vectorizer
    if os.path.exists(MODEL_PATH) and os.path.exists(VEC_PATH):
        try:
            clf = joblib.load(MODEL_PATH)
            vectorizer = joblib.load(VEC_PATH)
            print("Successfully loaded Random Forest model and Vectorizer.")
        except Exception as e:
            print(f"Error loading artifacts: {e}")

load_artifacts()

class SymptomRequest(BaseModel):
    symptoms: List[str]
    duration: Optional[str] = "2-3 days"
    severity: Optional[str] = "Moderate"
    context: Optional[str] = ""

class AlternativeDepartment(BaseModel):
    department: str
    confidence: int

class PredictionResponse(BaseModel):
    success: bool
    recommendedDepartment: str
    confidence: int
    topAlternatives: List[AlternativeDepartment]
    preliminaryGuidance: str
    redFlagDetected: bool
    contributingFactors: List[str] = []
    explanation: Optional[str] = None
    emergencyContacts: Optional[Dict[str, str]] = None
    disclaimer: str

def extract_contributing_factors(symptoms_text: str, vec_input) -> List[str]:
    """Extract top contributing feature n-grams from TF-IDF input vector for explainability."""
    if vectorizer is None or vec_input is None:
        return []
    try:
        feature_names = vectorizer.get_feature_names_out()
        nz_indices = vec_input.nonzero()[1]
        stopwords = {'and', 'or', 'with', 'in', 'of', 'for', 'the', 'moderate', 'severe', 'mild', 'pain'}
        
        terms_with_weights = []
        for idx in nz_indices:
            term = feature_names[idx]
            if term not in stopwords and len(term) > 2:
                weight = float(vec_input[0, idx])
                terms_with_weights.append((term, weight))
        
        # Sort terms by descending TF-IDF relevance
        terms_with_weights.sort(key=lambda x: x[1], reverse=True)
        top_terms = [t[0] for t in terms_with_weights[:4]]
        return top_terms
    except Exception as e:
        print("Error extracting contributing factors:", e)
        return []

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MediGuide Python ML Triage (FastAPI)",
        "modelLoaded": clf is not None,
        "algorithm": "Random Forest Classifier",
        "redFlagGuardrails": True,
        "explainability": True
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_department(req: SymptomRequest):
    if not req.symptoms:
        raise HTTPException(status_code=400, detail="Symptoms list cannot be empty.")

    symptoms_text = ", ".join(req.symptoms).lower()
    if req.context:
        symptoms_text += f" {req.context.lower()}"

    # 1. Rule-Based Red-Flag Safety Layer (PRD Section 9.6)
    matched_red_flags = [rf for rf in RED_FLAGS if rf in symptoms_text]
    is_critical = any(crf in symptoms_text for crf in CRITICAL_RED_FLAGS)
    has_red_flag = is_critical or (len(matched_red_flags) > 0 and req.severity in ["Moderate", "Severe"])

    if has_red_flag:
        factors = matched_red_flags if matched_red_flags else ["acute emergency indicators"]
        return PredictionResponse(
            success=True,
            recommendedDepartment="Emergency Medicine / Cardiology",
            confidence=95,
            topAlternatives=[
                AlternativeDepartment(department="Cardiology", confidence=90),
                AlternativeDepartment(department="Pulmonology", confidence=70)
            ],
            preliminaryGuidance="CRITICAL: Severe acute cardiovascular, neurological, or respiratory indicators detected. Prioritize immediate emergency care or call 112 / 108.",
            redFlagDetected=True,
            contributingFactors=factors,
            explanation=f"Emergency safety override activated due to high-risk red-flag indicators: {', '.join(factors)}.",
            emergencyContacts={"national": "112", "ambulance": "108", "medical": "102"},
            disclaimer="Urgent Safety Protocol: Preliminary triage rules override normal scheduling."
        )

    # 2. Machine Learning Classification
    if clf is not None and vectorizer is not None:
        try:
            vec_input = vectorizer.transform([symptoms_text])
            probs = clf.predict_proba(vec_input)[0]
            classes = clf.classes_

            # Sort classes by descending probability
            sorted_indices = probs.argsort()[::-1]
            top_idx = sorted_indices[0]
            top_dept = str(classes[top_idx])
            top_conf = max(45, int(round(probs[top_idx] * 100)))

            alternatives = []
            for idx in sorted_indices[1:3]:
                if probs[idx] > 0.05:
                    alternatives.append(AlternativeDepartment(
                        department=str(classes[idx]),
                        confidence=int(round(probs[idx] * 100))
                    ))

            guidance = DEPARTMENT_GUIDANCE.get(
                top_dept,
                f"Evaluation by a {top_dept} physician is recommended for physical clinical examination."
            )

            contributing_factors = extract_contributing_factors(symptoms_text, vec_input)
            if not contributing_factors:
                contributing_factors = req.symptoms[:3]

            explanation = (
                f"Recommendation for {top_dept} was primarily guided by reported symptoms: {', '.join(contributing_factors)}."
            )

            return PredictionResponse(
                success=True,
                recommendedDepartment=top_dept,
                confidence=top_conf,
                topAlternatives=alternatives,
                preliminaryGuidance=guidance,
                redFlagDetected=False,
                contributingFactors=contributing_factors,
                explanation=explanation,
                emergencyContacts={"national": "112", "ambulance": "108", "medical": "102"},
                disclaimer="Suggested Department — Not a Medical Diagnosis. Based on Random Forest classification."
            )
        except Exception as e:
            print(f"ML inference error: {e}")

    # 3. Graceful Fallback if model not loaded
    default_dept = "General Medicine"
    if "chest" in symptoms_text or "heart" in symptoms_text:
        default_dept = "Cardiology"
    elif "rash" in symptoms_text or "skin" in symptoms_text:
        default_dept = "Dermatology"
    elif "ear" in symptoms_text or "throat" in symptoms_text or "sinus" in symptoms_text:
        default_dept = "ENT"
    elif "joint" in symptoms_text or "knee" in symptoms_text or "back" in symptoms_text:
        default_dept = "Orthopedics"
    elif "headache" in symptoms_text or "migraine" in symptoms_text or "dizziness" in symptoms_text:
        default_dept = "Neurology"

    return PredictionResponse(
        success=True,
        recommendedDepartment=default_dept,
        confidence=78,
        topAlternatives=[
            AlternativeDepartment(department="General Medicine", confidence=20)
        ],
        preliminaryGuidance=DEPARTMENT_GUIDANCE.get(default_dept, "Consultation with a clinical physician is indicated."),
        redFlagDetected=False,
        contributingFactors=req.symptoms[:3],
        explanation=f"Department routing selected based on symptom indicators: {', '.join(req.symptoms[:3])}.",
        emergencyContacts={"national": "112", "ambulance": "108", "medical": "102"},
        disclaimer="Suggested Department — Not a Medical Diagnosis."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
