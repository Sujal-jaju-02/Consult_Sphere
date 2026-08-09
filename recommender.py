import os
from typing import Any

import numpy as np
import pandas as pd

from collections import Counter

from domain_classifier import predict_top_domains_with_probs
from hybrid_retriever import HybridRetriever


class ConsultantRecommender:
    def __init__(self, retriever: HybridRetriever, models_dir: str = "models") -> None:
        self.retriever = retriever
        self.models_dir = models_dir
        self.domain_keywords = self._build_domain_keywords()

        required_cols = ["Name", "Domain", "Years_Experience"]
        missing = [c for c in required_cols if c not in self.retriever.df.columns]
        if missing:
            raise ValueError(
                f"Model dataframe missing required columns: {', '.join(missing)}. Re-run training: python train_system.py"
            )

    def _build_domain_keywords(self) -> dict[str, list[str]]:
        df = self.retriever.df
        if "Domain" not in df.columns:
            return {}

        out: dict[str, list[str]] = {}
        if "Keywords" in df.columns:
            for domain, grp in df.groupby("Domain"):
                tokens: list[str] = []
                for raw in grp["Keywords"].fillna("").astype(str).tolist():
                    parts = [p.strip().lower() for p in raw.replace(";", ",").split(",")]
                    tokens.extend([p for p in parts if p])
                common = [t for t, _ in Counter(tokens).most_common(20)]
                out[str(domain)] = common
        return out

    def _expand_query(self, query: str, domains: list[str]) -> str:
        # Lightweight expansion to avoid domain bias: add only a few keywords.
        keywords: list[str] = []
        for d in domains[:2]:
            kws = self.domain_keywords.get(d, [])
            keywords.extend(kws[:2])

        keywords = [k for k in dict.fromkeys(keywords) if k]
        keywords = keywords[:3]
        if not keywords:
            return query
        return f"{query} {' '.join(keywords)}"

    @staticmethod
    def load(models_dir: str = "models") -> "ConsultantRecommender":
        if not os.path.exists(models_dir):
            raise FileNotFoundError(
                f"Models directory not found: {models_dir}. Run training first: python train_system.py"
            )
        retriever = HybridRetriever.load(models_dir=models_dir)
        return ConsultantRecommender(retriever=retriever, models_dir=models_dir)

    def recommend_consultants(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        if query is None:
            raise ValueError("Query cannot be null")
        query = str(query).strip()
        if not query:
            raise ValueError("Query cannot be empty")

        top_k = int(top_k)
        if top_k <= 0:
            top_k = 5

        domain_probs = predict_top_domains_with_probs(query, top_k=2, models_dir=self.models_dir)
        print("Predicted domains:", domain_probs)
        top_domain = str(domain_probs[0][0]) if domain_probs else ""
        print("Top domain:", top_domain)

        domains = [d for d, _ in domain_probs]
        domain_prob_map = {str(d): float(p) for d, p in domain_probs}

        expanded_query = self._expand_query(query, domains)

        merged_indices: list[int] = []
        merged_hybrid: list[float] = []
        merged_domain_prob: list[float] = []

        for d in domains:
            indices, hybrid = self.retriever.hybrid_scores(query=expanded_query, domain=d)
            if hybrid.size == 0:
                continue

            domain_prob = float(domain_prob_map.get(str(d), 0.0))
            if top_domain and str(d) != top_domain:
                hybrid = hybrid * 0.85

            merged_indices.extend([int(x) for x in indices.tolist()])
            merged_hybrid.extend([float(x) for x in hybrid.tolist()])
            merged_domain_prob.extend([domain_prob] * int(hybrid.size))

        if not merged_indices:
            return []

        indices_arr = np.asarray(merged_indices, dtype=int)
        hybrid_arr = np.asarray(merged_hybrid, dtype=float)
        domain_prob_arr = np.asarray(merged_domain_prob, dtype=float)

        exp_raw = pd.to_numeric(
            self.retriever.df.loc[indices_arr, "Years_Experience"], errors="coerce"
        ).fillna(0).astype(float)
        global_exp = pd.to_numeric(self.retriever.df["Years_Experience"], errors="coerce").fillna(0)
        max_exp = float(global_exp.max()) if len(global_exp) else 0.0
        denom = max_exp if max_exp > 0 else 1.0
        exp_norm = np.clip(exp_raw.to_numpy() / denom, 0.0, 1.0)

        final_score = hybrid_arr * (1.0 + domain_prob_arr) + 0.2 * exp_norm

        k = min(top_k, len(final_score))
        if k == 0:
            return []

        top_local = np.argpartition(-final_score, kth=k - 1)[:k]
        top_local = top_local[np.argsort(-final_score[top_local])]

        result: list[dict[str, Any]] = []
        for j in top_local:
            idx = int(indices_arr[int(j)])
            row = self.retriever.df.iloc[idx]
            experience = row.get("Years_Experience")
            name = row.get("Name")
            domain = row.get("Domain")
            print(
                "Consultant:",
                name,
                "Domain:",
                domain,
                "Score:",
                float(final_score[int(j)]),
            )
            result.append(
                {
                    "name": name,
                    "domain": domain,
                    "experience": 0.0 if pd.isna(experience) else float(experience),
                    "final_score": float(final_score[int(j)]),
                }
            )
        return result


_RECOMMENDER: ConsultantRecommender | None = None


def load_recommender(models_dir: str = "models") -> ConsultantRecommender:
    global _RECOMMENDER
    if _RECOMMENDER is None:
        _RECOMMENDER = ConsultantRecommender.load(models_dir=models_dir)
    return _RECOMMENDER


def recommend_consultants(query: str, top_k: int = 5) -> list[dict[str, Any]]:
    return load_recommender().recommend_consultants(query=query, top_k=top_k)
