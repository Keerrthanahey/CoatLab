"""CoatLab LangChain agent — orchestrates tools for natural-language interaction.

Uses Google Gemini as the LLM backbone. LangSmith traces all runs when
configured.
"""

from __future__ import annotations

import os
import logging
from typing import Any

logger = logging.getLogger("coatlab.agent")


def _get_llm():
    """Create a Gemini chat model using the GOOGLE_API_KEY env var."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        logger.warning("GOOGLE_API_KEY not set — agent will not be functional")
        return None

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.3,
            max_output_tokens=2048,
        )
    except Exception as e:
        logger.error("Failed to create Gemini LLM: %s", e)
        return None


def create_agent():
    """Create a ReAct agent with CoatLab tools."""
    from langgraph.prebuilt import create_react_agent

    from app.agents.tools import (
        predict_coating,
        optimize_coating,
        analyze_morphology,
        extract_figure_data,
    )
    from app.agents.prompts import SYSTEM_PROMPT

    llm = _get_llm()
    if llm is None:
        return None

    tools = [predict_coating, optimize_coating, analyze_morphology, extract_figure_data]

    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=SYSTEM_PROMPT,
    )
    return agent


_agent_cache = None


def get_agent():
    """Get or create the cached agent instance."""
    global _agent_cache
    if _agent_cache is None:
        _agent_cache = create_agent()
    return _agent_cache


def reset_agent():
    """Reset the cached agent (e.g. after config change)."""
    global _agent_cache
    _agent_cache = None


async def run_agent(user_message: str) -> dict[str, Any]:
    """Run the agent with a user message and return the result.

    Returns a dict with:
      - response: str (natural language answer)
      - tool_calls: list of tool invocations
      - demo: bool
    """
    agent = get_agent()
    if agent is None:
        return {
            "response": (
                "The CoatLab agent is not configured. "
                "Set GOOGLE_API_KEY in the backend .env file to enable AI chat."
            ),
            "tool_calls": [],
            "demo": True,
            "error": "Agent not configured",
        }

    try:
        from langchain_core.messages import HumanMessage

        result = await agent.ainvoke({
            "messages": [HumanMessage(content=user_message)],
        })

        messages = result.get("messages", [])
        tool_calls = []
        response_text = ""

        for msg in messages:
            msg_type = getattr(msg, "type", "")
            if msg_type == "ai":
                content = getattr(msg, "content", "")
                if content:
                    response_text = content
            elif msg_type == "tool":
                tool_calls.append({
                    "name": getattr(msg, "name", "unknown"),
                    "content": getattr(msg, "content", "")[:500],
                })

        return {
            "response": response_text or "No response generated.",
            "tool_calls": tool_calls,
            "demo": True,
        }

    except Exception as e:
        logger.error("Agent execution failed: %s", e, exc_info=True)
        return {
            "response": f"Agent error: {str(e)}",
            "tool_calls": [],
            "demo": True,
            "error": str(e),
        }
