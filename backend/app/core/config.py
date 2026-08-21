from __future__ import annotations

import os


class Settings:
    ALLOWED_ORIGINS: list[str]

    def __init__(self) -> None:
        raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3333")
        self.ALLOWED_ORIGINS = [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()
