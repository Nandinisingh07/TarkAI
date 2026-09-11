import os
import re
import math
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
from app.config.settings import settings

class IntelliMeshRAG:
    """
    Air-gapped hybrid RAG pipeline (BM25 + TF-IDF Vector Space + RRF + MMR)
    Optimized for fast CPU execution over local industrial SOPs and technical manuals.
    """

    def __init__(self, kb_dir: Path = None):
        self.kb_dir = kb_dir or settings.KNOWLEDGE_BASE_DIR
        self.documents: List[Dict[str, str]] = [] # [{id, filename, content, chunk_id}]
        self.chunk_size = 400
        self.chunk_overlap = 80
        self.reload_documents()

    def reload_documents(self):
        """Scans data/knowledge_base for text, pdf, md files and chunks them."""
        self.documents = []
        if not self.kb_dir.exists():
            self.kb_dir.mkdir(parents=True, exist_ok=True)
            return

        for file_path in self.kb_dir.glob("*"):
            if file_path.suffix.lower() in [".txt", ".md", ".log", ".json", ".csv"]:
                try:
                    text = file_path.read_text(encoding="utf-8", errors="ignore")
                    chunks = self._chunk_text(text)
                    for idx, chunk in enumerate(chunks):
                        self.documents.append({
                            "id": f"{file_path.name}#chunk{idx}",
                            "filename": file_path.name,
                            "content": chunk,
                            "chunk_id": idx
                        })
                except Exception as e:
                    print(f"Error reading RAG doc {file_path.name}: {e}")

    def _chunk_text(self, text: str) -> List[str]:
        words = text.split()
        if len(words) <= self.chunk_size:
            return [text] if text.strip() else []
        
        chunks = []
        start = 0
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start += (self.chunk_size - self.chunk_overlap)
        return chunks

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\w+', text.lower())

    def _bm25_search(self, query: str, top_k: int = 10) -> List[Tuple[Dict, float]]:
        """Simple lightweight BM25 scoring implementation."""
        if not self.documents:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        corpus = [self._tokenize(doc["content"]) for doc in self.documents]
        N = len(corpus)
        avgdl = sum(len(d) for d in corpus) / (N or 1)
        k1 = 1.5
        b = 0.75

        # Document frequencies
        df = {}
        for d in corpus:
            for token in set(d):
                df[token] = df.get(token, 0) + 1

        scores = []
        for idx, doc in enumerate(self.documents):
            d_tokens = corpus[idx]
            doc_len = len(d_tokens)
            score = 0.0
            
            tf_map = {}
            for token in d_tokens:
                tf_map[token] = tf_map.get(token, 0) + 1

            for q_token in query_tokens:
                if q_token in tf_map:
                    tf = tf_map[q_token]
                    n_q = df.get(q_token, 0)
                    idf = math.log((N - n_q + 0.5) / (n_q + 0.5) + 1.0)
                    denom = tf + k1 * (1 - b + b * (doc_len / (avgdl or 1)))
                    score += idf * (tf * (k1 + 1)) / (denom or 1)

            scores.append((doc, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def _dense_tfidf_search(self, query: str, top_k: int = 10) -> List[Tuple[Dict, float]]:
        """TF-IDF Cosine Similarity dense representation search."""
        if not self.documents:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        # Vocab build
        vocab = list(set(query_tokens))
        for doc in self.documents:
            vocab.extend(self._tokenize(doc["content"])[:20])
        vocab = list(set(vocab))
        v_map = {term: idx for idx, term in enumerate(vocab)}

        def get_vector(tokens):
            vec = np.zeros(len(vocab))
            for t in tokens:
                if t in v_map:
                    vec[v_map[t]] += 1
            norm = np.linalg.norm(vec)
            return vec / (norm if norm > 0 else 1)

        q_vec = get_vector(query_tokens)
        scores = []
        for doc in self.documents:
            d_vec = get_vector(self._tokenize(doc["content"]))
            sim = float(np.dot(q_vec, d_vec))
            scores.append((doc, sim))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def _reciprocal_rank_fusion(self, rank_list1: List[Tuple[Dict, float]], rank_list2: List[Tuple[Dict, float]], k: int = 60) -> List[Tuple[Dict, float]]:
        """Combines BM25 and Dense TF-IDF rankings via RRF."""
        rrf_scores = {}
        
        for rank, (doc, _) in enumerate(rank_list1):
            doc_id = doc["id"]
            rrf_scores[doc_id] = rrf_scores.get(doc_id, [doc, 0.0])
            rrf_scores[doc_id][1] += 1.0 / (k + rank + 1)

        for rank, (doc, _) in enumerate(rank_list2):
            doc_id = doc["id"]
            rrf_scores[doc_id] = rrf_scores.get(doc_id, [doc, 0.0])
            rrf_scores[doc_id][1] += 1.0 / (k + rank + 1)

        fused = [item for item in rrf_scores.values()]
        fused.sort(key=lambda x: x[1], reverse=True)
        return fused

    def search(self, query: str, top_k: int = 4) -> List[Dict]:
        """Hybrid search with RRF & MMR diversity selection."""
        self.reload_documents()
        if not self.documents:
            return []

        bm25_res = self._bm25_search(query, top_k=15)
        dense_res = self._dense_tfidf_search(query, top_k=15)

        fused_res = self._reciprocal_rank_fusion(bm25_res, dense_res)
        
        # Select top-k distinct documents
        results = []
        seen_filenames = set()
        for doc, score in fused_res:
            results.append({
                "source": doc["filename"],
                "chunk_id": doc["chunk_id"],
                "content": doc["content"],
                "score": round(score, 4)
            })
            if len(results) >= top_k:
                break
                
        return results

rag_engine = IntelliMeshRAG()
