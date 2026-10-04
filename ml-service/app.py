"""
MediGuide Machine Learning Triage Service
FastAPI REST microservice serving Random Forest department predictions
Meets PRD Section 9 & Techstack Section 8.5
Includes Explainable AI (Feature Attribution) and Red-Flag Safety Protocol
"""

import os
import json
import functools
from typing import List, Optional, Dict, Union
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

app = FastAPI(
    title="MediGuide ML Triage Service",
    description="Random Forest Medical Department Recommendation API with Safety Overrides",
    version="1.2.0"
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

# Load model and vectorizer once at startup, not per request
load_artifacts()

class SymptomRequest(BaseModel):
    symptoms: List[str]
    duration: Optional[str] = "2-3 days"
    severity: Optional[str] = "Moderate"
    context: Optional[str] = ""

class BatchPredictRequest(BaseModel):
    symptoms: List[str]

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

@functools.lru_cache(maxsize=1024)
def _cached_predict_json(normalized_text: str, severity: str) -> str:
    """Internal cached helper computing predictions on normalized symptom text."""
    # 1. Rule-Based Red-Flag Safety Layer (PRD Section 9.6)
    matched_red_flags = [rf for rf in RED_FLAGS if rf in normalized_text]
    is_critical = any(crf in normalized_text for crf in CRITICAL_RED_FLAGS)
    has_red_flag = is_critical or (len(matched_red_flags) > 0 and severity in ["Moderate", "Severe"])

    if has_red_flag:
        factors = matched_red_flags if matched_red_flags else ["acute emergency indicators"]
        return json.dumps({
            "success": True,
            "recommendedDepartment": "Emergency Medicine / Cardiology",
            "confidence": 95,
            "topAlternatives": [
                {"department": "Cardiology", "confidence": 90},
                {"department": "Pulmonology", "confidence": 70}
            ],
            "preliminaryGuidance": "CRITICAL: Severe acute cardiovascular, neurological, or respiratory indicators detected. Prioritize immediate emergency care or call 112 / 108.",
            "redFlagDetected": True,
            "contributingFactors": factors,
            "explanation": f"Emergency safety override activated due to high-risk red-flag indicators: {', '.join(factors)}.",
            "emergencyContacts": {"national": "112", "ambulance": "108", "medical": "102"},
            "disclaimer": "Urgent Safety Protocol: Preliminary triage rules override normal scheduling."
        })

    # 2. Machine Learning Classification
    if clf is not None and vectorizer is not None:
        try:
            vec_input = vectorizer.transform([normalized_text])
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
                    alternatives.append({
                        "department": str(classes[idx]),
                        "confidence": int(round(probs[idx] * 100))
                    })

            guidance = DEPARTMENT_GUIDANCE.get(
                top_dept,
                f"Evaluation by a {top_dept} physician is recommended for physical clinical examination."
            )

            contributing_factors = extract_contributing_factors(normalized_text, vec_input)
            if not contributing_factors:
                contributing_factors = [w.strip() for w in normalized_text.split(",")[:3] if w.strip()]

            explanation = (
                f"Recommendation for {top_dept} was primarily guided by reported symptoms: {', '.join(contributing_factors)}."
            )

            return json.dumps({
                "success": True,
                "recommendedDepartment": top_dept,
                "confidence": top_conf,
                "topAlternatives": alternatives,
                "preliminaryGuidance": guidance,
                "redFlagDetected": False,
                "contributingFactors": contributing_factors,
                "explanation": explanation,
                "emergencyContacts": {"national": "112", "ambulance": "108", "medical": "102"},
                "disclaimer": "Suggested Department — Not a Medical Diagnosis. Based on Random Forest classification."
            })
        except Exception as e:
            print(f"ML inference error: {e}")

    # 3. Graceful Fallback if model not loaded
    default_dept = "General Medicine"
    if "chest" in normalized_text or "heart" in normalized_text:
        default_dept = "Cardiology"
    elif "rash" in normalized_text or "skin" in normalized_text:
        default_dept = "Dermatology"
    elif "ear" in normalized_text or "throat" in normalized_text or "sinus" in normalized_text:
        default_dept = "ENT"
    elif "joint" in normalized_text or "knee" in normalized_text or "back" in normalized_text:
        default_dept = "Orthopedics"
    elif "headache" in normalized_text or "migraine" in normalized_text or "dizziness" in normalized_text:
        default_dept = "Neurology"

    return json.dumps({
        "success": True,
        "recommendedDepartment": default_dept,
        "confidence": 78,
        "topAlternatives": [
            {"department": "General Medicine", "confidence": 20}
        ],
        "preliminaryGuidance": DEPARTMENT_GUIDANCE.get(default_dept, "Consultation with a clinical physician is indicated."),
        "redFlagDetected": False,
        "contributingFactors": [w.strip() for w in normalized_text.split(",")[:3] if w.strip()],
        "explanation": f"Department routing selected based on symptom indicators: {normalized_text[:40]}.",
        "emergencyContacts": {"national": "112", "ambulance": "108", "medical": "102"},
        "disclaimer": "Suggested Department — Not a Medical Diagnosis."
    })

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

    normalized = " ".join(symptoms_text.strip().split())
    cached_json = _cached_predict_json(normalized, req.severity or "Moderate")
    res_dict = json.loads(cached_json)
    return PredictionResponse(**res_dict)

@app.post("/predict/batch", response_model=List[PredictionResponse])
def predict_department_batch(req: Union[List[str], BatchPredictRequest] = Body(...)):
    symptom_texts = req if isinstance(req, list) else req.symptoms
    if not symptom_texts:
        return []

    results = [None] * len(symptom_texts)
    ml_indices = []
    ml_texts = []

    # Check red-flags and normalize
    for i, raw_text in enumerate(symptom_texts):
        normalized = " ".join(raw_text.lower().strip().split())

        matched_red_flags = [rf for rf in RED_FLAGS if rf in normalized]
        is_critical = any(crf in normalized for crf in CRITICAL_RED_FLAGS)
        if is_critical or len(matched_red_flags) > 0:
            factors = matched_red_flags if matched_red_flags else ["acute emergency indicators"]
            results[i] = PredictionResponse(
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
        else:
            ml_indices.append(i)
            ml_texts.append(normalized)

    # Vectorize together in a single call for all ML candidate items
    if ml_texts and clf is not None and vectorizer is not None:
        try:
            vec_matrix = vectorizer.transform(ml_texts)
            all_probs = clf.predict_proba(vec_matrix)
            classes = clf.classes_

            for batch_pos, original_idx in enumerate(ml_indices):
                probs = all_probs[batch_pos]
                sorted_indices = probs.argsort()[::-1]
                top_idx = sorted_indices[0]
                top_dept = str(classes[top_idx])
                top_conf = max(45, int(round(probs[top_idx] * 100)))

                alternatives = []
                for s_idx in sorted_indices[1:3]:
                    if probs[s_idx] > 0.05:
                        alternatives.append(AlternativeDepartment(
                            department=str(classes[s_idx]),
                            confidence=int(round(probs[s_idx] * 100))
                        ))

                guidance = DEPARTMENT_GUIDANCE.get(
                    top_dept,
                    f"Evaluation by a {top_dept} physician is recommended for physical clinical examination."
                )

                row_vec = vec_matrix[batch_pos]
                factors = extract_contributing_factors(ml_texts[batch_pos], row_vec)
                if not factors:
                    factors = [w.strip() for w in ml_texts[batch_pos].split(",")[:3] if w.strip()]

                explanation = f"Recommendation for {top_dept} was primarily guided by reported symptoms: {', '.join(factors)}."

                results[original_idx] = PredictionResponse(
                    success=True,
                    recommendedDepartment=top_dept,
                    confidence=top_conf,
                    topAlternatives=alternatives,
                    preliminaryGuidance=guidance,
                    redFlagDetected=False,
                    contributingFactors=factors,
                    explanation=explanation,
                    emergencyContacts={"national": "112", "ambulance": "108", "medical": "102"},
                    disclaimer="Suggested Department — Not a Medical Diagnosis. Based on Random Forest classification."
                )
        except Exception as e:
            print(f"Batch ML inference error: {e}")

    # Fallback for any unassigned indices
    for i, r in enumerate(results):
        if r is None:
            normalized = " ".join(symptom_texts[i].lower().strip().split())
            default_dept = "General Medicine"
            if "chest" in normalized or "heart" in normalized:
                default_dept = "Cardiology"
            elif "rash" in normalized or "skin" in normalized:
                default_dept = "Dermatology"
            elif "ear" in normalized or "throat" in normalized or "sinus" in normalized:
                default_dept = "ENT"
            elif "joint" in normalized or "knee" in normalized or "back" in normalized:
                default_dept = "Orthopedics"
            elif "headache" in normalized or "migraine" in normalized or "dizziness" in normalized:
                default_dept = "Neurology"

            results[i] = PredictionResponse(
                success=True,
                recommendedDepartment=default_dept,
                confidence=78,
                topAlternatives=[
                    AlternativeDepartment(department="General Medicine", confidence=20)
                ],
                preliminaryGuidance=DEPARTMENT_GUIDANCE.get(default_dept, "Consultation with a clinical physician is indicated."),
                redFlagDetected=False,
                contributingFactors=[w.strip() for w in normalized.split(",")[:3] if w.strip()],
                explanation=f"Department routing selected based on symptom indicators: {normalized[:40]}.",
                emergencyContacts={"national": "112", "ambulance": "108", "medical": "102"},
                disclaimer="Suggested Department — Not a Medical Diagnosis."
            )

    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
