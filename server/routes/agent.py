from copy import error

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from repath_agent.services.agent_service import send_agent_message


router = APIRouter(
    prefix="/api/agent",
    tags=["agent"],
)


class AgentMessageRequest(BaseModel):
    message: str
    session_id: str | None = None


class AgentMessageResponse(BaseModel):
    session_id: str
    response: str


@router.post("/message", response_model=AgentMessageResponse)
async def message_agent(body: AgentMessageRequest):
    message = body.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    try:
        return await send_agent_message(
            message=message,
            session_id=body.session_id,
        )

    except Exception as error:
        print("Agent error:", error)

        error_message = str(error)

        if "RESOURCE_EXHAUSTED" in error_message or "429" in error_message:
            raise HTTPException(
                status_code=429,
                detail="RePath is temporarily at its AI usage limit.",
            ) from error

        raise HTTPException(
            status_code=500,
            detail="Unable to process agent message.",
        ) from error