import os
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parent


def _parse_origins(value: str) -> list[str]:
    return [
        origin
        for origin in (origin.strip() for origin in value.split(","))
        if origin and origin != "*"
    ]


def _parse_int(value: str, default: int) -> int:
    try:
        return int(value)
    except ValueError:
        return default

GOOGLE_CLOUD_PROJECT = os.getenv(
    "GOOGLE_CLOUD_PROJECT",
    "repath-506704",
)

ALLOWED_ORIGINS = _parse_origins(
    os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
)

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))

MAX_DOCUMENT_UPLOAD_SIZE_BYTES = _parse_int(
    os.getenv("MAX_DOCUMENT_UPLOAD_SIZE_BYTES", ""),
    10 * 1024 * 1024,
)

DEFAULT_ADK_SESSION_DB_PATH = SERVER_DIR / "data" / "adk_sessions.db"
ADK_SESSION_DB_URL = os.getenv(
    "ADK_SESSION_DB_URL",
    f"sqlite+aiosqlite:///{DEFAULT_ADK_SESSION_DB_PATH.as_posix()}",
)
