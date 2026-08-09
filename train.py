import os

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


def _resolve_dataset_path() -> str:
    candidates = [
        "Random_Mixed_100_Dataset_With_Keywords.csv",
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(
        "Dataset not found. Expected at ./Random_Mixed_100_Dataset_With_Keywords.csv"
    )


def main() -> None:
    dataset_path = _resolve_dataset_path()
    df = pd.read_csv(dataset_path)

    required_cols = ["Current_Role", "Skills", "Keywords", "Domain", "Target_Sector"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    for col in required_cols:
        df[col] = df[col].fillna("").astype(str)

    df["search_text"] = (
        df["Current_Role"]
        + " "
        + df["Skills"]
        + " "
        + df["Keywords"]
        + " "
        + df["Domain"]
        + " "
        + df["Target_Sector"]
    ).str.strip()

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=30000,
        min_df=1,
        sublinear_tf=True,
        stop_words="english",
    )

    consultant_matrix = vectorizer.fit_transform(df["search_text"])

    os.makedirs("models", exist_ok=True)
    joblib.dump(vectorizer, os.path.join("models", "tfidf_vectorizer.pkl"))
    joblib.dump(consultant_matrix, os.path.join("models", "consultant_matrix.pkl"))
    joblib.dump(df, os.path.join("models", "consultant_df.pkl"))

    print("Training complete. Saved models to models/.")


if __name__ == "__main__":
    main()
