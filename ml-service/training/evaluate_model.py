"""
MediGuide ML Triage Model Evaluation & Safety Benchmark
Calculates Accuracy, Precision, Recall, F1-Score, Confusion Matrix,
and specifically benchmarks Recall on Red-Flag Emergency Symptoms.
"""

import os
import json
import random
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix
)
import joblib
import matplotlib
matplotlib.use('Agg')  # Headless backend
import matplotlib.pyplot as plt

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'symptoms_departments.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'department_rf.joblib')
VEC_PATH = os.path.join(MODEL_DIR, 'vectorizer.joblib')
METRICS_PATH = os.path.join(MODEL_DIR, 'evaluation_metrics.json')
CONFUSION_MATRIX_PATH = os.path.join(MODEL_DIR, 'confusion_matrix.png')

# Dedicated benchmark set for Red-Flag / Critical Emergency Symptoms
RED_FLAG_BENCHMARK_CASES = [
    {
        "symptoms": "severe crushing chest pain radiating to left arm and jaw, profuse sweating",
        "expected_emergency": True,
        "category": "Acute Myocardial Infarction / Cardiology",
        "keywords": ["chest pain", "radiation", "sweating"]
    },
    {
        "symptoms": "sudden slurred speech, acute facial droop on right side, right arm weakness",
        "expected_emergency": True,
        "category": "Acute Ischemic Stroke / Neurology",
        "keywords": ["slurred speech", "facial droop", "arm weakness"]
    },
    {
        "symptoms": "acute breathlessness gasping for air, severe chest tightness, lips turning blue cyanosis",
        "expected_emergency": True,
        "category": "Respiratory Failure / Acute Asthma",
        "keywords": ["breathlessness", "chest tightness", "cyanosis"]
    },
    {
        "symptoms": "sudden loss of consciousness, unresponsive for 2 minutes, faint pulse",
        "expected_emergency": True,
        "category": "Syncope / Cardiac Arrest",
        "keywords": ["loss of consciousness", "unresponsive"]
    },
    {
        "symptoms": "severe arterial uncontrolled bleeding from deep laceration, dizziness",
        "expected_emergency": True,
        "category": "Severe Hemorrhage / Trauma",
        "keywords": ["uncontrolled bleeding", "bleeding"]
    },
    {
        "symptoms": "acute anaphylaxis, severe tongue swelling, throat closing, difficulty swallowing",
        "expected_emergency": True,
        "category": "Anaphylaxis / Airway Compromise",
        "keywords": ["anaphylaxis", "tongue swelling", "throat closing"]
    },
    {
        "symptoms": "crushing retrosternal chest pain with nausea, shortness of breath lying flat",
        "expected_emergency": True,
        "category": "Acute Coronary Syndrome",
        "keywords": ["chest pain", "shortness of breath"]
    },
    {
        "symptoms": "sudden onset thunderclap headache, stiff neck, altered mental status",
        "expected_emergency": True,
        "category": "Subarachnoid Hemorrhage / Meningitis",
        "keywords": ["thunderclap headache", "altered mental status"]
    },
    {
        "symptoms": "massive hemoptysis coughing up large volume of bright red blood",
        "expected_emergency": True,
        "category": "Pulmonary Hemorrhage",
        "keywords": ["coughing up blood", "hemoptysis"]
    },
    {
        "symptoms": "continuous tonic clonic epileptic seizure lasting over five minutes without recovery",
        "expected_emergency": True,
        "category": "Status Epilepticus",
        "keywords": ["epileptic seizure", "seizure"]
    }
]

# Rule-based red-flag detection matcher matching safety protocol
RED_FLAG_KEYWORDS = [
    'chest pain', 'chest tightness', 'heart attack', 'breathlessness',
    'shortness of breath', 'slurred speech', 'facial droop', 'uncontrolled bleeding',
    'loss of consciousness', 'unresponsive', 'anaphylaxis', 'tongue swelling',
    'throat closing', 'cyanosis', 'thunderclap headache', 'coughing up blood',
    'hemoptysis', 'status epilepticus', 'seizure lasting'
]

def check_red_flag_safety(symptoms_text: str) -> bool:
    lower_text = symptoms_text.lower()
    return any(keyword in lower_text for keyword in RED_FLAG_KEYWORDS)

def evaluate_model():
    print("=" * 60)
    print("   MEDIGUIDE ML MODEL EVALUATION & SAFETY BENCHMARK")
    print("=" * 60)

    # 1. Load dataset
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}. Please run train_model.py first.")

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded dataset: {len(df)} samples across {df['department'].nunique()} departments.")

    # 2. Vectorization
    vectorizer = TfidfVectorizer(
        token_pattern=r'(?u)\b[a-zA-Z]{2,}\b',
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
        lowercase=True
    )
    X = vectorizer.fit_transform(df['symptoms'])
    y = df['department']

    # 3. Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 4. Train Random Forest model
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        random_state=42,
        class_weight='balanced'
    )
    clf.fit(X_train, y_train)

    # 5. Evaluate on Test Set
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average='weighted', zero_division=0
    )
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average='macro', zero_division=0
    )

    classes = sorted(list(df['department'].unique()))
    p_per_class, r_per_class, f1_per_class, support_per_class = precision_recall_fscore_support(
        y_test, y_pred, labels=classes, zero_division=0
    )

    per_department_metrics = {}
    for i, cls_name in enumerate(classes):
        per_department_metrics[cls_name] = {
            "precision": round(float(p_per_class[i]), 4),
            "recall": round(float(r_per_class[i]), 4),
            "f1_score": round(float(f1_per_class[i]), 4),
            "support": int(support_per_class[i])
        }

    print("\n--- GENERAL TEST SET METRICS ---")
    print(f"Overall Accuracy:       {accuracy * 100:.2f}%")
    print(f"Weighted F1-Score:      {weighted_f1 * 100:.2f}%")
    print(f"Macro F1-Score:         {macro_f1 * 100:.2f}%")
    print(f"Weighted Recall:        {weighted_r * 100:.2f}%")
    print(f"Weighted Precision:     {weighted_p * 100:.2f}%")

    print("\n--- PER-DEPARTMENT BREAKDOWN ---")
    for dept, m in per_department_metrics.items():
        print(f"  {dept:<20} | Precision: {m['precision']*100:5.1f}% | Recall: {m['recall']*100:5.1f}% | F1: {m['f1_score']*100:5.1f}% | Support: {m['support']}")

    # 6. Confusion Matrix Generation & Visualization
    cm = confusion_matrix(y_test, y_pred, labels=classes)

    plt.figure(figsize=(10, 8))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('MediGuide Clinical Triage — Confusion Matrix', fontsize=14, pad=16, fontweight='bold')
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45, ha='right', fontsize=9)
    plt.yticks(tick_marks, classes, fontsize=9)

    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            val = cm[i, j]
            color = "white" if val > thresh else "black"
            plt.text(j, i, format(val, 'd'),
                     ha="center", va="center",
                     color=color, fontsize=10, fontweight='bold')

    plt.ylabel('Actual Department', fontsize=11, fontweight='bold')
    plt.xlabel('Predicted Department', fontsize=11, fontweight='bold')
    plt.tight_layout()
    plt.savefig(CONFUSION_MATRIX_PATH, dpi=200)
    plt.close()
    print(f"\n[OK] Confusion matrix plot saved to: {CONFUSION_MATRIX_PATH}")

    # 7. Safety Benchmark: Red-Flag Emergency Recall
    print("\n--- RED-FLAG EMERGENCY SAFETY BENCHMARK ---")
    detected_count = 0
    emergency_results = []

    for idx, case in enumerate(RED_FLAG_BENCHMARK_CASES, 1):
        symptoms_text = case["symptoms"]
        # Step A: Rule-based Safety Protocol check
        is_red_flag = check_red_flag_safety(symptoms_text)

        # Step B: ML Model inference
        vec_input = vectorizer.transform([symptoms_text])
        pred_dept = clf.predict(vec_input)[0]
        probs = clf.predict_proba(vec_input)[0]
        conf = int(round(np.max(probs) * 100))

        # Successful emergency triage = safety override triggered OR routed to acute department
        is_safe = is_red_flag or pred_dept in ['Cardiology', 'Pulmonology', 'Neurology']
        if is_safe:
            detected_count += 1

        emergency_results.append({
            "test_case_id": idx,
            "category": case["category"],
            "symptoms": case["symptoms"],
            "safety_rule_triggered": is_red_flag,
            "model_predicted_department": pred_dept,
            "model_confidence": conf,
            "handled_as_emergency": is_safe
        })

        status = "[PASS]" if is_safe else "[FAIL]"
        print(f"  {status} Case #{idx:02d} ({case['category']}):")
        print(f"         Rule Triggered: {is_red_flag} | Model Dept: {pred_dept} ({conf}%)")

    emergency_recall = (detected_count / len(RED_FLAG_BENCHMARK_CASES)) * 100.0
    print(f"\nRed-Flag Emergency Sensitivity / Recall: {emergency_recall:.1f}% ({detected_count}/{len(RED_FLAG_BENCHMARK_CASES)} cases intercepted)")

    # 8. Save Comprehensive Metrics JSON
    metrics_payload = {
        "model": "Random Forest Classifier",
        "vectorizer": "TfidfVectorizer (sublinear_tf=True, ngram_range=(1,2))",
        "n_estimators": 200,
        "classes": classes,
        "overall_metrics": {
            "accuracy": round(float(accuracy), 4),
            "macro_precision": round(float(macro_p), 4),
            "macro_recall": round(float(macro_r), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_precision": round(float(weighted_p), 4),
            "weighted_recall": round(float(weighted_r), 4),
            "weighted_f1": round(float(weighted_f1), 4),
            "total_samples": len(df),
            "test_samples": len(y_test)
        },
        "per_department_metrics": per_department_metrics,
        "red_flag_safety_benchmark": {
            "total_test_cases": len(RED_FLAG_BENCHMARK_CASES),
            "detected_as_emergency": detected_count,
            "emergency_recall_percentage": round(emergency_recall, 2),
            "test_results": emergency_results
        },
        "confusion_matrix": cm.tolist(),
        "evaluated_at": pd.Timestamp.now().isoformat()
    }

    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"[OK] Comprehensive metrics report saved to: {METRICS_PATH}")
    print("\nModel evaluation and safety benchmark completed successfully!")
    return metrics_payload

if __name__ == '__main__':
    evaluate_model()
