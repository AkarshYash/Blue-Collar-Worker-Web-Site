"""
RAG (Retrieval-Augmented Generation) service using Pinecone vector store.
Indexes platform FAQs, policies, and documentation so the chatbot can
answer questions accurately without hallucinating.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Built-in FAQ corpus (seeded on first run if Pinecone is available)
# ---------------------------------------------------------------------------
FAQ_CORPUS: list[dict] = [
    {"id": "faq-001", "text": "How do I book a worker? Go to Search, pick a worker, choose a time slot, pay the advance, and confirm. The worker gets notified instantly.", "category": "booking"},
    {"id": "faq-002", "text": "What is the cancellation policy? Cancel 2+ hours before: 50% advance refunded. Cancel within 2 hours: no refund. Worker no-show: full refund.", "category": "policy"},
    {"id": "faq-003", "text": "How do I get verified as a worker? Upload Aadhaar + selfie for Level 1. Add PAN + address proof for Level 2. Pass skill test for Level 3. Submit police clearance for Level 4.", "category": "worker"},
    {"id": "faq-004", "text": "What payment methods are accepted? UPI (GPay, PhonePe, Paytm, Amazon Pay, BHIM, WhatsApp Pay), Visa, Mastercard, and wallet balance.", "category": "payment"},
    {"id": "faq-005", "text": "How long does a refund take? UPI refunds: 2-3 business days. Card refunds: 5-7 business days. Wallet refunds: instant.", "category": "payment"},
    {"id": "faq-006", "text": "How is the platform commission calculated? BlueCollar charges 15% on each completed job. Workers receive 85% of the agreed amount.", "category": "earnings"},
    {"id": "faq-007", "text": "How do I withdraw my earnings? Go to Wallet > Withdraw. Choose UPI (2% fee, instant), bank transfer (free, 2-3 hrs), or cash pickup (1% fee).", "category": "earnings"},
    {"id": "faq-008", "text": "What if the worker does poor quality work? Raise a dispute within 24 hours. Provide photos/videos. The platform will mediate and may offer a free revisit or refund.", "category": "dispute"},
    {"id": "faq-009", "text": "How does the rating system work? Customers rate workers 1-5 stars after job completion. Ratings cover quality, punctuality, communication, and value.", "category": "rating"},
    {"id": "faq-010", "text": "Is my personal data safe? Yes. Aadhaar and PAN data is encrypted at rest. Phone numbers are masked in chat. We comply with India's DPDP Act.", "category": "privacy"},
    {"id": "faq-011", "text": "How do I report a safety concern? Tap the emergency button in the app or call our 24/7 hotline. The booking will be flagged and support will contact you immediately.", "category": "safety"},
    {"id": "faq-012", "text": "What languages does the chatbot support? Sahayak supports 100+ languages including all 22 scheduled Indian languages: Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, and more.", "category": "chatbot"},
]


class RAGService:
    """
    Wraps Pinecone for semantic FAQ retrieval.
    Falls back to keyword search if Pinecone is unavailable.
    """

    def __init__(self):
        self._index = None
        self._embedder = None
        self._init_pinecone()

    def _init_pinecone(self):
        api_key = os.getenv("PINECONE_API_KEY")
        index_name = os.getenv("PINECONE_INDEX", "bluecollar-faq")
        if not api_key:
            logger.info("PINECONE_API_KEY not set — RAG will use keyword fallback.")
            return
        try:
            from pinecone import Pinecone
            pc = Pinecone(api_key=api_key)
            self._index = pc.Index(index_name)
            self._init_embedder()
            logger.info("Pinecone RAG index '%s' connected.", index_name)
        except Exception as exc:
            logger.warning("Pinecone init failed: %s — using keyword fallback.", exc)

    def _init_embedder(self):
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            self._embedder = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
        except Exception as exc:
            logger.warning("Embedder init failed: %s", exc)

    # ------------------------------------------------------------------
    def seed_index(self):
        """Upsert FAQ corpus into Pinecone (run once at setup)."""
        if not self._index or not self._embedder:
            logger.warning("Cannot seed — Pinecone or embedder not available.")
            return
        vectors = []
        for item in FAQ_CORPUS:
            embedding = self._embedder.embed_query(item["text"])
            vectors.append({
                "id": item["id"],
                "values": embedding,
                "metadata": {"text": item["text"], "category": item["category"]},
            })
        self._index.upsert(vectors=vectors)
        logger.info("Seeded %d FAQ entries into Pinecone.", len(vectors))

    # ------------------------------------------------------------------
    def retrieve(self, query: str, top_k: int = 3) -> list[str]:
        """Return top-k relevant FAQ snippets for the given query."""
        if self._index and self._embedder:
            return self._vector_search(query, top_k)
        return self._keyword_search(query, top_k)

    def _vector_search(self, query: str, top_k: int) -> list[str]:
        try:
            embedding = self._embedder.embed_query(query)
            results = self._index.query(vector=embedding, top_k=top_k, include_metadata=True)
            return [m["metadata"]["text"] for m in results.get("matches", [])]
        except Exception as exc:
            logger.warning("Vector search failed: %s", exc)
            return self._keyword_search(query, top_k)

    def _keyword_search(self, query: str, top_k: int) -> list[str]:
        """Simple keyword overlap fallback."""
        query_words = set(query.lower().split())
        scored = []
        for item in FAQ_CORPUS:
            item_words = set(item["text"].lower().split())
            score = len(query_words & item_words)
            if score > 0:
                scored.append((score, item["text"]))
        scored.sort(reverse=True)
        return [text for _, text in scored[:top_k]]

    def build_context(self, query: str) -> Optional[str]:
        """Return a formatted context string to inject into the LLM prompt."""
        snippets = self.retrieve(query)
        if not snippets:
            return None
        joined = "\n\n".join(f"- {s}" for s in snippets)
        return f"Relevant platform information:\n{joined}"
