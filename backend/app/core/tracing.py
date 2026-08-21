from __future__ import annotations

import os
import logging

logger = logging.getLogger("coatlab.tracing")

LANGSMITH_ENABLED = False
_tracer = None

try:
    from langsmith import traceable, Client

    if os.getenv("LANGCHAIN_API_KEY") or os.getenv("LANGSMITH_API_KEY"):
        LANGSMITH_ENABLED = True
        os.environ.setdefault("LANGCHAIN_PROJECT", "CoatLab")
        os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")
        logger.info("LangSmith tracing enabled for project: %s", os.getenv("LANGCHAIN_PROJECT"))
    else:
        logger.info("LangSmith tracing disabled — set LANGCHAIN_API_KEY to enable")

except ImportError:
    logger.info("langsmith package not installed — tracing unavailable")


    def traceable(func=None, *, name: str | None = None, run_type: str = "chain", tags: list[str] | None = None):
        """No-op fallback when langsmith is not installed."""
        def decorator(fn):
            return fn
        if func is not None:
            return func
        return decorator


def get_client():
    """Return LangSmith client if configured, else None."""
    if not LANGSMITH_ENABLED:
        return None
    try:
        return Client()
    except Exception:
        logger.warning("Failed to create LangSmith client")
        return None


def log_prediction(input_data: dict, output_data: dict, tags: list[str] | None = None) -> None:
    """Log a prediction run to LangSmith if enabled."""
    if not LANGSMITH_ENABLED:
        return
    try:
        client = get_client()
        if client:
            client.create_run(
                name="CoatLab-ML-Predict",
                run_type="chain",
                inputs=input_data,
                outputs=output_data,
                tags=tags or ["ml", "prediction"],
                project_name=os.getenv("LANGCHAIN_PROJECT", "CoatLab"),
            )
    except Exception:
        logger.debug("Failed to log prediction to LangSmith")


def log_optimization(input_data: dict, output_data: dict) -> None:
    """Log an optimization run to LangSmith."""
    if not LANGSMITH_ENABLED:
        return
    try:
        client = get_client()
        if client:
            client.create_run(
                name="CoatLab-ML-Optimize",
                run_type="chain",
                inputs=input_data,
                outputs={"total_evaluated": output_data.get("total_evaluated", 0)},
                tags=["ml", "optimization"],
                project_name=os.getenv("LANGCHAIN_PROJECT", "CoatLab"),
            )
    except Exception:
        logger.debug("Failed to log optimization to LangSmith")


def log_analysis(analysis_type: str, input_summary: dict, output_summary: dict) -> None:
    """Log an image analysis run to LangSmith."""
    if not LANGSMITH_ENABLED:
        return
    try:
        client = get_client()
        if client:
            client.create_run(
                name=f"CoatLab-{analysis_type}",
                run_type="chain",
                inputs=input_summary,
                outputs=output_summary,
                tags=["analysis", analysis_type.lower()],
                project_name=os.getenv("LANGCHAIN_PROJECT", "CoatLab"),
            )
    except Exception:
        logger.debug("Failed to log analysis to LangSmith")


def log_error(error_type: str, error_message: str, context: dict | None = None) -> None:
    """Log an error to LangSmith."""
    if not LANGSMITH_ENABLED:
        return
    try:
        client = get_client()
        if client:
            client.create_run(
                name=f"CoatLab-Error-{error_type}",
                run_type="chain",
                inputs=context or {},
                outputs={"error": error_message},
                tags=["error", error_type.lower()],
                project_name=os.getenv("LANGCHAIN_PROJECT", "CoatLab"),
            )
    except Exception:
        logger.debug("Failed to log error to LangSmith")
