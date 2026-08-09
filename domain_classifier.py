import os
from typing import Any

import joblib
import numpy as np


_DOMAIN_VECTORIZER: Any | None = None
_DOMAIN_CLASSIFIER: Any | None = None


def _load(models_dir: str = "models") -> tuple[Any, Any]:
    global _DOMAIN_VECTORIZER, _DOMAIN_CLASSIFIER

    if _DOMAIN_VECTORIZER is not None and _DOMAIN_CLASSIFIER is not None:
        return _DOMAIN_VECTORIZER, _DOMAIN_CLASSIFIER

    vectorizer_path = os.path.join(models_dir, "domain_vectorizer.pkl")
    classifier_path = os.path.join(models_dir, "domain_classifier.pkl")

    if not (os.path.exists(vectorizer_path) and os.path.exists(classifier_path)):
        raise FileNotFoundError(
            "Domain classifier files not found. Run training first: python train_system.py"
        )

    _DOMAIN_VECTORIZER = joblib.load(vectorizer_path)
    _DOMAIN_CLASSIFIER = joblib.load(classifier_path)
    return _DOMAIN_VECTORIZER, _DOMAIN_CLASSIFIER


def predict_domain(query: str, models_dir: str = "models") -> str:
    if query is None:
        raise ValueError("Query cannot be null")
    query = str(query).strip()
    if not query:
        raise ValueError("Query cannot be empty")

    vectorizer, clf = _load(models_dir=models_dir)
    X = vectorizer.transform([query])
    pred = clf.predict(X)
    return str(pred[0])


def predict_top_domains(query: str, top_n: int = 2, models_dir: str = "models") -> list[str]:
    if query is None:
        raise ValueError("Query cannot be null")
    query = str(query).strip()
    if not query:
        raise ValueError("Query cannot be empty")

    top_n = int(top_n)
    if top_n <= 0:
        top_n = 1

    vectorizer, clf = _load(models_dir=models_dir)
    X = vectorizer.transform([query])

    if not hasattr(clf, "predict_proba"):
        return [predict_domain(query, models_dir=models_dir)]

    probs = clf.predict_proba(X)[0]
    classes = getattr(clf, "classes_", None)
    if classes is None:
        return [predict_domain(query, models_dir=models_dir)]

    order = np.argsort(-probs)
    out: list[str] = []
    for i in order[: min(top_n, len(order))]:
        out.append(str(classes[int(i)]))
    return out


def predict_top_domains_with_probs(
    query: str, top_k: int = 2, models_dir: str = "models"
) -> list[tuple[str, float]]:
    if query is None:
        raise ValueError("Query cannot be null")
    query = str(query).strip()
    if not query:
        raise ValueError("Query cannot be empty")

    top_k = int(top_k)
    if top_k <= 0:
        top_k = 1

    vectorizer, clf = _load(models_dir=models_dir)
    X = vectorizer.transform([query])

    if not hasattr(clf, "predict_proba"):
        return [(predict_domain(query, models_dir=models_dir), 1.0)]

    probs = clf.predict_proba(X)[0]
    classes = getattr(clf, "classes_", None)
    if classes is None:
        return [(predict_domain(query, models_dir=models_dir), 1.0)]

    order = np.argsort(-probs)
    out: list[tuple[str, float]] = []
    for i in order[: min(top_k, len(order))]:
        out.append((str(classes[int(i)]), float(probs[int(i)])))
    return out


def predict_domain_proba(query: str, models_dir: str = "models") -> list[tuple[str, float]]:
    if query is None:
        raise ValueError("Query cannot be null")
    query = str(query).strip()
    if not query:
        raise ValueError("Query cannot be empty")

    vectorizer, clf = _load(models_dir=models_dir)
    X = vectorizer.transform([query])

    if not hasattr(clf, "predict_proba"):
        return [(predict_domain(query, models_dir=models_dir), 1.0)]

    probs = clf.predict_proba(X)[0]
    classes = getattr(clf, "classes_", None)
    if classes is None:
        return [(predict_domain(query, models_dir=models_dir), 1.0)]

    pairs = [(str(classes[i]), float(probs[i])) for i in range(len(classes))]
    pairs.sort(key=lambda x: x[1], reverse=True)
    return pairs
