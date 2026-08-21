from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.tracing import log_prediction, log_error

router = APIRouter(prefix="/api/agent", tags=["agent"])


class AgentChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, description="User message for the CoatLab agent")


class AgentChatResponse(BaseModel):
    response: str
    tool_calls: list[dict] = []
    demo: bool = True
    error: str | None = None


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(request: AgentChatRequest) -> AgentChatResponse:
    from app.agents.agent import run_agent

    log_prediction(
        {"message": request.message},
        {},
        tags=["agent", "chat"],
    )

    result = await run_agent(request.message)

    if result.get("error"):
        log_error("agent_chat", result["error"], context={"message": request.message})

    return AgentChatResponse(
        response=result["response"],
        tool_calls=result.get("tool_calls", []),
        demo=result.get("demo", True),
        error=result.get("error"),
    )
