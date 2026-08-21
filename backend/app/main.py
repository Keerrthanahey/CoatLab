from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

app = FastAPI(
    title="CoatLab API",
    description=(
        "Materials Intelligence Platform — Mg coating process-property "
        "prediction, optimization, morphology analysis, figure extraction, "
        "and AI-powered research assistant."
    ),
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes import (
    materials,
    predict,
    microstructure,
    literature,
    dataset,
    model,
    ml,
    analysis,
    morphology,
    figure,
    agent,
)

app.include_router(materials.router)
app.include_router(predict.router)
app.include_router(microstructure.router)
app.include_router(literature.router)
app.include_router(dataset.router)
app.include_router(model.router)
app.include_router(ml.router)
app.include_router(analysis.router)
app.include_router(morphology.router)
app.include_router(figure.router)
app.include_router(agent.router)


@app.get("/api/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logging.getLogger("coatlab").error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
