from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes import materials, predict, microstructure, literature, dataset, model

app = FastAPI(
    title="CoatLab API",
    description="Materials Intelligence Platform — Mg coating process-property prediction",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(materials.router)
app.include_router(predict.router)
app.include_router(microstructure.router)
app.include_router(literature.router)
app.include_router(dataset.router)
app.include_router(model.router)

from app.api.routes import ml, analysis
app.include_router(ml.router)
app.include_router(analysis.router)


@app.get("/api/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
