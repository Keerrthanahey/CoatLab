from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, UploadFile, File

from app.schemas.types import LiteratureStatus, LiteratureQueryResult

router = APIRouter(prefix="/api/literature", tags=["literature"])

_mock_answers: list[dict[str, Any]] = [
    {
        "keywords": ["electrolyte", "bath", "composition"],
        "answer": (
            "Across the indexed corpus, the most frequently reported electrolytes for "
            "plasma electrolytic oxidation (PEO/MAO) coatings on magnesium are alkaline "
            "silicate and phosphate baths. Common formulations include Na2SiO3·9H2O "
            "(10–25 g/L), Na3PO4·12H2O (5–20 g/L), and KOH or NaOH (2–10 g/L) used as "
            "pH stabilizers. Alkaline fluoride additives (KF) appear in roughly a third "
            "of reports."
        ),
        "citations": [
            {"paperId": "2021-014", "page": "3", "metric": "Table 1 — bath compositions"},
            {"paperId": "2022-089", "page": "5", "metric": "Methods §2.1"},
            {"paperId": "2020-041", "page": "7", "metric": "Table 2"},
        ],
    },
    {
        "keywords": ["current densit", "cd", "ampere", "a/dm"],
        "answer": (
            "Reported current densities for Mg coating processes cluster between 1 and "
            "20 A/dm². Unipolar pulsed modes typically use 3–8 A/dm², while higher-density "
            "regimes (10–20 A/dm²) appear in papers optimizing coating thickness at the "
            "cost of increased porosity."
        ),
        "citations": [
            {"paperId": "2021-014", "page": "4", "metric": "Fig. 2 — CD range"},
            {"paperId": "2019-112", "page": "9", "metric": "Results"},
        ],
    },
    {
        "keywords": ["porosity", "lower", "dense", "compact"],
        "answer": (
            "Lower porosity was consistently associated with: (1) moderate current "
            "densities (3–6 A/dm²) rather than extremes; (2) higher pulse frequencies "
            "(≥1000 Hz) which refine spark distribution; (3) shorter processing times "
            "(<15 min) that limit pore coalescence; and (4) silicate-rich electrolytes."
        ),
        "citations": [
            {"paperId": "2022-089", "page": "6", "metric": "Fig. 4 — porosity vs duty cycle"},
            {"paperId": "2020-041", "page": "8", "metric": "Discussion"},
        ],
    },
]

_fallback: dict[str, Any] = {
    "answer": (
        "The indexed knowledge base does not yet contain a response that directly "
        "matches this question. Once the literature ingestion pipeline (LangChain/"
        "LlamaIndex + vector store) is connected and papers are indexed, I will be "
        "able to answer with source citations. For now this is a demonstration response."
    ),
    "citations": [],
}

_counter = 0


@router.get("/status", response_model=LiteratureStatus)
async def literature_status() -> LiteratureStatus:
    return LiteratureStatus(documents=0, indexed=0, status="not_indexed", lastIndexedAt=None)


@router.post("/upload")
async def literature_upload(files: list[UploadFile] = File(...)) -> dict[str, str]:
    count = len(files)
    return {"message": f"Received {count} file(s). Indexing not yet implemented (demo)."}


@router.post("/query", response_model=LiteratureQueryResult)
async def literature_query(body: dict[str, Any]) -> LiteratureQueryResult:
    global _counter
    _counter += 1
    question: str = body.get("question", "").lower()

    match = None
    for entry in _mock_answers:
        if any(kw in question for kw in entry["keywords"]):
            match = entry
            break

    base = match or _fallback
    return LiteratureQueryResult(
        id=f"lit-{int(time.time() * 1000)}-{_counter}",
        answer=base["answer"],
        citations=base["citations"],
        demo=True,
    )
