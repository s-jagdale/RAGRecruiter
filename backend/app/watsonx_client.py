"""
Reusable watsonx.ai client wrapper — lazy initialization.

Connections are created on the first actual call, not at import time.
This means the server starts instantly; watsonx.ai is only contacted
when a user triggers a real AI operation (gap analysis, question gen, etc.)
"""

from ibm_watsonx_ai import Credentials, APIClient
from ibm_watsonx_ai.foundation_models import ModelInference, Embeddings

from app import config

# ── Lazy singletons ──────────────────────────────────────────────────────────
_client        = None
_chat_model    = None
_embedding_model = None


def _get_client():
    global _client
    if _client is None:
        _client = APIClient(
            Credentials(url=config.WATSONX_REGION_URL, api_key=config.WATSONX_API_KEY),
            project_id=config.WATSONX_PROJECT_ID,
        )
    return _client


def _get_chat_model():
    global _chat_model
    if _chat_model is None:
        _chat_model = ModelInference(
            api_client=_get_client(),
            model_id=config.WATSONX_MODEL_ID,
        )
    return _chat_model


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = Embeddings(
            api_client=_get_client(),
            model_id=config.WATSONX_EMBEDDING_MODEL_ID,
        )
    return _embedding_model


# ── Public API ───────────────────────────────────────────────────────────────

def granite_chat(messages: list[dict], temperature: float = 0.7, max_tokens: int = 1000) -> str:
    response = _get_chat_model().chat(
        messages=messages,
        params={"temperature": temperature, "max_tokens": max_tokens},
    )
    return response["choices"][0]["message"]["content"]


def get_embeddings(texts: list[str]) -> list[list[float]]:
    return _get_embedding_model().embed_documents(texts=texts)
