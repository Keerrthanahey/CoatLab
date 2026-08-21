from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter

from app.schemas.types import MicrostructureResult

router = APIRouter(prefix="/api", tags=["microstructure"])

_counter = 0


@router.post("/analyze-microstructure", response_model=MicrostructureResult)
async def analyze_microstructure(body: dict[str, Any]) -> MicrostructureResult:
    global _counter
    _counter += 1
    file_name: str = body.get("fileName", "unknown.tif")
    return MicrostructureResult(
        id=f"mic-{int(time.time() * 1000)}-{_counter}",
        fileName=file_name,
        analyzedAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        imageWidthPx=2048,
        imageHeightPx=1536,
        poreCount=184,
        porosity=3.72,
        avgPoreSize=2.13,
        maxPoreSize=8.42,
        minPoreSize=0.42,
        distribution=[
            {"bin": "0–1", "count": 18},
            {"bin": "1–2", "count": 41},
            {"bin": "2–3", "count": 52},
            {"bin": "3–4", "count": 33},
            {"bin": "4–5", "count": 19},
            {"bin": "5–6", "count": 11},
            {"bin": "6–7", "count": 6},
            {"bin": "7–8", "count": 3},
            {"bin": "8–9", "count": 1},
        ],
        demo=True,
    )
