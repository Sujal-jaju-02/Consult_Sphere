import os

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


def _resolve_dataset_path() -> str:
    path = "Random_Mixed_100_Dataset_With_Keywords.csv"
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at ./{path}")
    return path


def main() -> None:
    dataset_path = _resolve_dataset_path()
    df = pd.read_csv(dataset_path)

    required_cols = [
        "Domain",
        "Current_Role",
        "Skills",
        "Keywords",
        "Target_Sector",
        "Consultation_Query",
    ]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    for c in required_cols:
        df[c] = df[c].fillna("").astype(str)

    domain_clf_text = (
        df["Current_Role"]
        + " "
        + df["Skills"]
        + " "
        + df["Keywords"]
        + " "
        + df["Target_Sector"]
        + " "
        + df["Consultation_Query"]
    ).str.strip()

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=30000,
        min_df=1,
        sublinear_tf=True,
        stop_words="english",
    )
    X = vectorizer.fit_transform(domain_clf_text)
    y = df["Domain"].astype(str)

    clf = LogisticRegression(max_iter=2000, class_weight="balanced")
    clf.fit(X, y)

    os.makedirs("models", exist_ok=True)
    joblib.dump(vectorizer, os.path.join("models", "domain_vectorizer.pkl"))
    joblib.dump(clf, os.path.join("models", "domain_classifier.pkl"))

    print("Domain classifier training complete. Saved to models/.")


if __name__ == "__main__":
    main()
