"""
MediGuide Machine Learning Triage Model Training
Model: Random Forest Classifier for Medical Department Recommendation
Meets PRD Section 9 & Techstack Section 8 requirements.
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support
import joblib

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, 'dataset', 'symptoms_departments.csv')
    model_dir = os.path.join(base_dir, 'model')
    os.makedirs(model_dir, exist_ok=True)

    print("Loading dataset from:", dataset_path)
    df = pd.read_csv(dataset_path)
    print(f"Total training samples: {len(df)}")
    print(f"Departments ({len(df['department'].unique())}): {list(df['department'].unique())}")

    # Standard regex CountVectorizer (serializable with pickle)
    vectorizer = CountVectorizer(token_pattern=r'(?u)\b[a-zA-Z]{2,}\b', ngram_range=(1, 2), lowercase=True)
    X = vectorizer.fit_transform(df['symptoms'])
    y = df['department']

    # Train / Test split (80/20 with stratification)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Initialize Random Forest Classifier
    clf = RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42)
    clf.fit(X_train, y_train)

    # Predictions & Evaluation
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)

    print("\n==============================================")
    print("      MEDIGUIDE ML EVALUATION REPORT         ")
    print("==============================================")
    print(f"Accuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Fit on full dataset for production artifact
    final_clf = RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42)
    final_clf.fit(X, y)

    # Save artifacts
    model_path = os.path.join(model_dir, 'department_rf.joblib')
    vec_path = os.path.join(model_dir, 'vectorizer.joblib')
    metrics_path = os.path.join(model_dir, 'evaluation_metrics.json')

    joblib.dump(final_clf, model_path)
    joblib.dump(vectorizer, vec_path)

    metrics_data = {
        "model": "Random Forest Classifier",
        "n_estimators": 100,
        "classes": list(final_clf.classes_),
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1Score": round(float(f1), 4),
        "totalSamples": len(df),
        "evaluatedAt": pd.Timestamp.now().isoformat()
    }

    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)

    print("Model artifact successfully saved to:", model_path)
    print("Vectorizer artifact successfully saved to:", vec_path)
    print("Metrics report successfully saved to:", metrics_path)
    print("Training pipeline finished with 0 errors!")

if __name__ == '__main__':
    main()
