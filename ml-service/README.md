# MediGuide ML Triage Microservice

FastAPI-powered machine learning microservice providing statistical medical department recommendations, explainable feature attribution, and deterministic emergency red-flag safety overrides for the **MediGuide** college healthcare ecosystem.

---

## 1. Overview & Architecture

- **Framework**: FastAPI (REST microservice, port 8000)
- **Algorithm**: Random Forest Classifier with Sublinear TF-IDF Vectorization
- **Purpose**: Preliminary patient routing to the appropriate medical specialist (e.g., Cardiology, Neurology, Dermatology, Orthopedics, ENT, Pediatrics, Pulmonology, Gastroenterology, General Medicine).
- **Core Principle**: **Safety-First Triage**. Statistical predictions never override urgent clinical red flags. Emergency presentations deterministically trigger high-acuity protocols and direct patients to emergency responders (112, 108).

```
   [Patient Symptom Input]
              │
              ▼
   ┌────────────────────────────────────────┐
   │ Deterministic Safety Layer (Red-Flags) │ ──(Triggered)──► [Emergency Alert + Call 112/108]
   └────────────────────────────────────────┘
              │ (Safe for Outpatient)
              ▼
   ┌────────────────────────────────────────┐
   │ TF-IDF Vectorizer (Unigrams & Bigrams) │
   └────────────────────────────────────────┘
              │
              ▼
   ┌────────────────────────────────────────┐
   │ Random Forest Classifier (200 Trees)   │
   └────────────────────────────────────────┘
              │
              ▼
   ┌────────────────────────────────────────┐
   │ Explainability Engine (XAI Features)   │
   └────────────────────────────────────────┘
              │
              ▼
   [Recommended Department + Alternatives + Contributing Symptoms]
```

---

## 2. Clinical Department Taxonomy

The model classifies patient presentations into **9 clinical departments**:

1. **Cardiology**: Chest tightness, angina, palpitations, radiating left arm pain, breathlessness lying flat, hypertension.
2. **Dermatology**: Skin rashes, pruritus, eczema, psoriasis plaques, urticaria, melasma, acne vulgaris.
3. **ENT**: Sore throat, earache, tinnitus, nasal congestion, hoarseness, sinus headache, tonsillitis.
4. **Gastroenterology**: Acid reflux, dyspepsia, severe constipation, abdominal bloating, peptic pain, jaundice.
5. **General Medicine**: Viral fever, chills, fatigue, malaise, dehydration, body ache, wellness checkup.
6. **Neurology**: Migraine with/without aura, tension headache, vertigo, numbness, facial weakness, tremors.
7. **Orthopedics**: Knee joint pain, lumbago, cervical spondylosis, ligament sprain, frozen shoulder, fractures.
8. **Pediatrics**: Infantile colic, pediatric barking croup, teething pain, child high fever, chickenpox rash.
9. **Pulmonology**: Chronic deep cough, yellow sputum, bronchial wheezing, asthma flare, pleuritic pain, COPD.

---

## 3. Machine Learning Methodology

### Feature Extraction (TF-IDF)
- **Token Pattern**: `(?u)\b[a-zA-Z]{2,}\b` (strips single-letter artifacts while preserving medical terminology)
- **N-gram Range**: `(1, 2)` (captures compound medical phrases like `"chest pain"`, `"joint stiffness"`, `"dry scaly"`)
- **Sublinear TF**: `sublinear_tf=True` (applies logarithmic term frequency scaling $1 + \log(\text{tf})$ to prevent high-frequency common words from dominating)

### Model Selection: Random Forest vs Alternatives
- **Ensemble of Decision Trees (`n_estimators=200`)**: Robust against sparse text feature vectors and non-linear symptom interactions.
- **Class Balancing (`class_weight='balanced'`)**: Compensates for class size variations across specialties.
- **Zero Variance Overfitting Protection**: Outperforms single decision trees and naive Bayes on multi-symptom co-occurrences.
- **Microsecond Latency**: Inferences execute in `< 15ms`, suitable for real-time triage.

---

## 4. Evaluation Benchmark & Results

Evaluated using a **Stratified 80/20 Train/Test Split** on the clinical corpus (`random_state=42`):

| Metric | Score |
|---|---|
| **Overall Accuracy** | **94.83%** |
| **Weighted F1-Score** | **94.87%** |
| **Macro F1-Score** | **95.36%** |
| **Weighted Precision** | **95.72%** |
| **Weighted Recall** | **94.83%** |
| **Red-Flag Emergency Sensitivity / Recall** | **100.0%** (10/10 emergency cases intercepted) |

### Per-Department Breakdown
- **Cardiology**: Precision: 88.2% | Recall: 100.0% | F1: 93.8%
- **Dermatology**: Precision: 80.0% | Recall: 100.0% | F1: 88.9%
- **ENT**: Precision: 100.0% | Recall: 80.0% | F1: 88.9%
- **Gastroenterology**: Precision: 100.0% | Recall: 100.0% | F1: 100.0%
- **General Medicine**: Precision: 100.0% | Recall: 92.9% | F1: 96.3%
- **Neurology**: Precision: 100.0% | Recall: 91.7% | F1: 95.7%
- **Orthopedics**: Precision: 100.0% | Recall: 100.0% | F1: 100.0%
- **Pediatrics**: Precision: 100.0% | Recall: 90.0% | F1: 94.7%
- **Pulmonology**: Precision: 100.0% | Recall: 100.0% | F1: 100.0%

### Artifacts Generated
- Confusion Matrix Plot: `model/confusion_matrix.png`
- Comprehensive Evaluation Metrics: `model/evaluation_metrics.json`
- Serialized Model: `model/department_rf.joblib`
- Serialized Vectorizer: `model/vectorizer.joblib`

---

## 5. Explainable AI (XAI) & Feature Attribution

To avoid "black-box" decision making, each prediction extracts the most influential non-stopword feature n-grams from the patient's reported symptoms using their TF-IDF vector weights.

**Sample Explanation Output**:
```json
{
  "recommendedDepartment": "Orthopedics",
  "confidence": 99,
  "contributingFactors": ["knee", "joint pain", "stiffness", "crepitus"],
  "explanation": "Recommendation for Orthopedics was primarily guided by reported symptoms: knee, joint pain, stiffness, crepitus."
}
```

---

## 6. Red-Flag Emergency Protocols

The service intercepts time-critical medical emergencies prior to ML scoring:
- **Cardiovascular**: Crushing chest pain, left-arm radiation, acute myocardial indicators.
- **Neurological**: Sudden slurred speech, facial droop, one-sided paralysis (FAST stroke signs), status epilepticus.
- **Respiratory / Airway**: Acute breathlessness, choking, severe anaphylaxis, cyanosis (blue lips).
- **Trauma / Hemorrhage**: Arterial uncontrolled bleeding, syncope / loss of consciousness.

When an emergency is detected:
- `redFlagDetected: true`
- `urgencyLevel: "High / Seek Immediate Care"`
- Recommended routing switches to **Emergency Medicine**
- Emergency helpline numbers (`112` National Emergency, `108` Ambulance, `102` Medical) are supplied directly in the response.

---

## 7. Running the Service & Training Pipeline

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Model Training & Evaluation
```bash
# Trains model, generates confusion_matrix.png and evaluation_metrics.json
python training/train_model.py

# Benchmark standalone evaluation and emergency recall
python training/evaluate_model.py
```

### Start the REST API
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

## 8. Clinical Limitations & Viva Defense Questions

**Q1: Why is this not considered an automated diagnosis?**
> *Answer*: The model performs **clinical triage routing** (administrative guidance on which medical specialist to consult) rather than pathological diagnosis. It suggests medical specialties, not disease labels.

**Q2: Why use Random Forest instead of a Deep Neural Network (BERT/LLM)?**
> *Answer*: Random Forest with TF-IDF runs in sub-15ms, does not require GPU infrastructure, has zero latency jitter, is fully deterministic, and is immune to generative hallucination. For college clinics in low-connectivity areas, edge CPU execution is essential.

**Q3: How do you guarantee patient safety if the ML model makes a wrong prediction?**
> *Answer*: We employ a **three-tier defense-in-depth architecture**:
> 1. *Deterministic rule-based red-flag safety filter* that runs before ML inference.
> 2. *Secondary backend guardrail* in Node.js that checks red flags independently even if the ML microservice is unreachable.
> 3. *Mandatory clinical disclaimers* and direct escalation paths to Indian emergency helplines (112 / 108).
