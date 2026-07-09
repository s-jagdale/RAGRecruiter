"""
Loads configuration from environment variables (.env file).
Never hardcode secrets directly in code — always load them from here.
"""

import os
from dotenv import load_dotenv

load_dotenv()

WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
WATSONX_REGION_URL = os.getenv("WATSONX_REGION_URL")
WATSONX_MODEL_ID = os.getenv("WATSONX_MODEL_ID")
WATSONX_EMBEDDING_MODEL_ID = os.getenv("WATSONX_EMBEDDING_MODEL_ID")

# Watson Speech to Text — powers the voice-answer delivery feature.
# Optional: the app still runs fine without it, the voice endpoint just
# returns a clear error if someone hits it without these configured.
STT_API_KEY = os.getenv("STT_API_KEY")
STT_URL = os.getenv("STT_URL")

required_vars = {
    "WATSONX_API_KEY": WATSONX_API_KEY,
    "WATSONX_PROJECT_ID": WATSONX_PROJECT_ID,
    "WATSONX_REGION_URL": WATSONX_REGION_URL,
    "WATSONX_MODEL_ID": WATSONX_MODEL_ID,
}

missing = [name for name, value in required_vars.items() if not value]
if missing:
    raise EnvironmentError(
        f"Missing required environment variables: {', '.join(missing)}. "
        f"Check your .env file."
    )

if not STT_API_KEY or not STT_URL:
    print("[config] STT_API_KEY / STT_URL not set — voice-answer feature will be unavailable.")