import os
import shutil

import joblib
import numpy as np
import pandas as pd
from rank_bm25 import BM25Okapi
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


DATA_PATH = "consultant_dataset_10000_rich.csv"


def _ensure_empty_dir(dir_path: str) -> None:
    os.makedirs(dir_path, exist_ok=True)
    for name in os.listdir(dir_path):
        path = os.path.join(dir_path, name)
        if os.path.isfile(path):
            os.remove(path)
        elif os.path.isdir(path):
            shutil.rmtree(path)


def _tokenize(text: str) -> list[str]:
    # Simple, fast tokenizer for BM25
    if text is None:
        return []
    return [t for t in str(text).lower().split() if t]


def main() -> None:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    required_cols = [
        "Name",
        "Domain",
        "Years_Experience",
        "Skills",
        "Keywords",
        "Consultation_Query",
        "Bio",
    ]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(missing)}")

    text_cols = ["Skills", "Keywords", "Consultation_Query", "Bio"]
    for c in text_cols:
        df[c] = df[c].fillna("").astype(str)

    df["Domain"] = df["Domain"].fillna("").astype(str)

    df["search_text"] = (
        df["Skills"]
        + " "
        + df["Keywords"]
        + " "
        + df["Consultation_Query"]
        + " "
        + df["Bio"]
        + " "
        + df["Domain"]
    ).str.strip()

    _ensure_empty_dir("models")

    # 1) Domain classifier (TF-IDF + Logistic Regression)
    domain_vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=30000,
        min_df=1,
        sublinear_tf=True,
        stop_words="english",
    )
    X = domain_vectorizer.fit_transform(df["search_text"])
    y = df["Domain"].astype(str)

    domain_clf = LogisticRegression(max_iter=2000, class_weight="balanced")
    domain_clf.fit(X, y)

    joblib.dump(domain_vectorizer, os.path.join("models", "domain_vectorizer.pkl"))
    joblib.dump(domain_clf, os.path.join("models", "domain_classifier.pkl"))

    # 2) BM25 per-domain indexes
    bm25_store: dict[str, dict[str, object]] = {}
    for domain, grp in df.groupby("Domain"):
        idx = grp.index.to_numpy(dtype=int)
        tokenized_corpus = [_tokenize(t) for t in grp["search_text"].tolist()]
        bm25_store[str(domain)] = {
            "indices": idx,
            "bm25": BM25Okapi(tokenized_corpus),
        }

    joblib.dump(bm25_store, os.path.join("models", "bm25_store.pkl"))

    # 3) Semantic embeddings
    try:
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer("all-MiniLM-L6-v2")
        embeddings = model.encode(
            df["search_text"].tolist(),
            batch_size=32,
            normalize_embeddings=True,
            show_progress_bar=True,
        )
        embeddings = np.asarray(embeddings, dtype=np.float32)
        np.save(os.path.join("models", "consultant_embeddings.npy"), embeddings)
    except OSError as e:
        raise OSError(
            "Failed to generate embeddings because torch could not load on this machine. "
            "If you only need to update the domain classifier, run: python train_domain_classifier.py. "
            "Otherwise increase your Windows paging file / available memory and rerun: python train_system.py. "
            f"Original error: {e}"
        )

    # 4) Save dataframe
    joblib.dump(df, os.path.join("models", "consultant_df.pkl"))

    print("Training complete. Saved hybrid retrieval artifacts to models/.")


if __name__ == "__main__":
    main()
