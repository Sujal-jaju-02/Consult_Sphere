import os
import re
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

import joblib
import numpy as np
import pandas as pd
from rank_bm25 import BM25Okapi


_WORD_RE = re.compile(r"[a-z0-9]+")


if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer


def _tokenize(text: str) -> list[str]:
    if text is None:
        return []
    return _WORD_RE.findall(str(text).lower())


def _minmax_norm(x: np.ndarray) -> np.ndarray:
    if x.size == 0:
        return x
    x_min = float(np.min(x))
    x_max = float(np.max(x))
    if x_max <= x_min:
        return np.zeros_like(x, dtype=float)
    return (x - x_min) / (x_max - x_min)


def _l2_normalize(v: np.ndarray) -> np.ndarray:
    n = float(np.linalg.norm(v))
    if n <= 0:
        return v
    return v / n


@dataclass(frozen=True)
class DomainIndex:
    indices: np.ndarray
    bm25: BM25Okapi


class HybridRetriever:
    def __init__(
        self,
        df: pd.DataFrame,
        embeddings: np.ndarray,
        domain_indexes: dict[str, DomainIndex],
        model: "SentenceTransformer",
    ) -> None:
        self.df = df
        self.embeddings = embeddings
        self.domain_indexes = domain_indexes
        self.model = model

    @staticmethod
    def load(models_dir: str = "models") -> "HybridRetriever":
        df_path = os.path.join(models_dir, "consultant_df.pkl")
        emb_path = os.path.join(models_dir, "consultant_embeddings.npy")
        bm25_path = os.path.join(models_dir, "bm25_store.pkl")

        if not (os.path.exists(df_path) and os.path.exists(emb_path) and os.path.exists(bm25_path)):
            raise FileNotFoundError(
                "Hybrid retriever files not found. Run training first: python train_system.py"
            )

        df = joblib.load(df_path)
        embeddings = np.load(emb_path)
        bm25_store: dict[str, dict[str, Any]] = joblib.load(bm25_path)

        domain_indexes: dict[str, DomainIndex] = {}
        for domain, payload in bm25_store.items():
            idx = np.asarray(payload["indices"], dtype=int)
            bm25 = payload["bm25"]
            domain_indexes[str(domain)] = DomainIndex(indices=idx, bm25=bm25)

        try:
            from sentence_transformers import SentenceTransformer

            model = SentenceTransformer("all-MiniLM-L6-v2")
            model.encode(["warmup"], normalize_embeddings=True)
        except OSError as e:
            raise OSError(
                "Failed to load embedding model because torch could not load on this machine. "
                "Increase your Windows paging file / available memory and restart the server. "
                f"Original error: {e}"
            )
        return HybridRetriever(df=df, embeddings=embeddings, domain_indexes=domain_indexes, model=model)

    def _semantic_scores(self, query: str, indices: np.ndarray) -> np.ndarray:
        q_emb = self.model.encode([query], normalize_embeddings=True)
        q = np.asarray(q_emb[0], dtype=float)
        subset = self.embeddings[indices]
        if subset.ndim != 2:
            subset = np.asarray(subset)
        # Ensure L2-normalized; training script saves normalized, but be safe.
        subset = subset / (np.linalg.norm(subset, axis=1, keepdims=True) + 1e-12)
        q = _l2_normalize(q)
        sims = subset @ q
        return np.asarray(sims, dtype=float)

    def hybrid_scores(self, query: str, domain: str) -> tuple[np.ndarray, np.ndarray]:
        if domain not in self.domain_indexes:
            return np.array([], dtype=int), np.array([], dtype=float)

        dindex = self.domain_indexes[domain]
        bm25_scores = np.asarray(dindex.bm25.get_scores(_tokenize(query)), dtype=float)
        sem_scores = self._semantic_scores(query=query, indices=dindex.indices)

        bm25_norm = _minmax_norm(bm25_scores)
        sem_norm = _minmax_norm(sem_scores)
        hybrid = 0.35 * bm25_norm + 0.65 * sem_norm
        return dindex.indices, hybrid
