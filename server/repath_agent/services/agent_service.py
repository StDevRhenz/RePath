import uuid

from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from repath_agent.agent import root_agent

load_dotenv()

APP_NAME = "repath_agent"
USER_ID = "repath_user"

session_service = InMemorySessionService()

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


async def create_agent_session() -> str:
    session_id = str(uuid.uuid4())

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )

    return session_id


async def send_agent_message(
    message: str,
    session_id: str | None = None,
) -> dict:
    if not session_id:
        session_id = await create_agent_session()

    content = types.Content(
        role="user",
        parts=[
            types.Part(text=message),
        ],
    )

    final_response = ""

    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response = "".join(
                    part.text or ""
                    for part in event.content.parts
                )

    return {
        "session_id": session_id,
        "response": final_response,
    }