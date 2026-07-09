"""
RAG retriever — embeds the knowledge base into a Chroma vector store and
retrieves the most relevant chunks for a given query (e.g. a job role + resume gaps).

Embeddings are cached to disk (rag_embeddings_cache.json) so they are only
computed once via watsonx.ai, not on every server restart.
"""

import json
import os
import hashlib
import chromadb
from app.watsonx_client import get_embeddings
from app.rag.knowledge_base import get_all_documents, get_documents_by_role

_CACHE_FILE = "rag_embeddings_cache.json"

_chroma_client = chromadb.Client()
_collection = _chroma_client.get_or_create_collection(name="interview_knowledge_base")

_index_built = False


def _content_hash(texts: list[str]) -> str:
    """Fingerprint the knowledge base content so cache is invalidated when text changes."""
    combined = "||".join(texts)
    return hashlib.md5(combined.encode()).hexdigest()


def _load_cache() -> dict | None:
    if not os.path.exists(_CACHE_FILE):
        return None
    try:
        with open(_CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _save_cache(data: dict):
    try:
        with open(_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f)
    except Exception:
        pass


def build_index():
    """
    Embeds all knowledge base documents and loads them into Chroma.
    Uses a disk cache so watsonx.ai is only called when the knowledge base changes.
    """
    global _index_built

    if _index_built:
        return

    documents = get_all_documents()
    texts     = [doc["content"] for doc in documents]
    ids       = [doc["id"]      for doc in documents]
    metadatas = [{"role": doc["role"], "category": doc["category"]} for doc in documents]

    current_hash = _content_hash(texts)
    cache = _load_cache()

    if cache and cache.get("hash") == current_hash:
        # Cache hit — no network call needed
        embeddings = cache["embeddings"]
        print("[RAG] Loaded embeddings from disk cache.")
    else:
        # Cache miss — call watsonx.ai and save result
        print("[RAG] Computing embeddings via watsonx.ai (first run or knowledge base changed)…")
        embeddings = get_embeddings(texts)
        _save_cache({"hash": current_hash, "embeddings": embeddings})
        print("[RAG] Embeddings cached to disk.")

    _collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )

    _index_built = True


# Track → which knowledge base categories are relevant for retrieval.
# "mixed"/None means no category restriction (pull from everything).
_TRACK_CATEGORIES = {
    "technical":   ["technical_question"],
    "soft_skills": ["soft_skills_question", "star_example"],
    "behavioral":  ["behavioral_question", "star_example"],
}


def _eq_or_or(field: str, values: list[str]) -> dict:
    """
    Builds a Chroma where-condition for 'field equals any of values'.
    Chroma rejects $or/$and lists with fewer than 2 elements, so a
    single value collapses to a plain equality condition instead.
    """
    if len(values) == 1:
        return {field: values[0]}
    return {"$or": [{field: v} for v in values]}


def retrieve_relevant_chunks(query: str, role: str = None, top_k: int = 5, track: str = None) -> list[dict]:
    """
    Retrieves the top_k most relevant knowledge base chunks for a given query.

    query: e.g. "behavioral questions about teamwork for a software engineer"
    role: optional filter, e.g. "software_engineer" — narrows results to that role + general
    top_k: how many chunks to return
    track: optional filter, e.g. "soft_skills" — narrows results to categories relevant to that track
    """
    if not _index_built:
        build_index()

    query_embedding = get_embeddings([query])[0]

    conditions = []
    if role:
        normalized_role = role.lower().strip().replace(" ", "_")
        conditions.append(_eq_or_or("role", [normalized_role, "general"]))

    track_categories = _TRACK_CATEGORIES.get(track) if track else None
    if track_categories:
        conditions.append(_eq_or_or("category", track_categories))

    if len(conditions) == 0:
        where_filter = None
    elif len(conditions) == 1:
        where_filter = conditions[0]
    else:
        where_filter = {"$and": conditions}

    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter
    )

    chunks = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    for text, metadata in zip(documents, metadatas):
        chunks.append({
            "content": text,
            "role": metadata.get("role"),
            "category": metadata.get("category")
        })

    return chunks