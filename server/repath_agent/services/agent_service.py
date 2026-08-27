import uuid

from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from repath_agent.agent import root_agent
from repath_agent.services.firestore_service import (
    get_case,
    link_case_agent_session,
    save_case_message,
)

load_dotenv()

APP_NAME = "repath_agent"
USER_ID = "repath_user"

session_service = InMemorySessionService()

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


class AgentCaseNotFoundError(Exception):
    pass


class AgentSessionLinkError(Exception):
    pass


class AgentMessagePersistenceError(Exception):
    pass


async def create_agent_session() -> str:
    session_id = str(uuid.uuid4())

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )

    return session_id


async def get_agent_session(session_id: str):
    return await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )


async def resolve_agent_session(
    session_id: str | None = None,
    case_id: str | None = None,
) -> str:
    case = None

    if case_id:
        case = get_case(case_id)

        if case is None:
            raise AgentCaseNotFoundError()

    if session_id:
        resolved_session_id = session_id
    elif case:
        resolved_session_id = case.get("agent_session_id")
    else:
        resolved_session_id = None

    if resolved_session_id:
        existing_session = await get_agent_session(resolved_session_id)

        if existing_session is not None:
            if case_id and not case.get("agent_session_id"):
                updated_case = link_case_agent_session(
                    case_id,
                    resolved_session_id,
                )

                if updated_case is None:
                    raise AgentSessionLinkError()

            return resolved_session_id

    fresh_session_id = await create_agent_session()

    if case_id and (
        not case.get("agent_session_id")
        or case.get("agent_session_id") == resolved_session_id
        or not session_id
    ):
        updated_case = link_case_agent_session(
            case_id,
            fresh_session_id,
        )

        if updated_case is None:
            raise AgentSessionLinkError()

    return fresh_session_id


async def send_agent_message(
    message: str,
    session_id: str | None = None,
    case_id: str | None = None,
) -> dict:
    session_id = await resolve_agent_session(
        session_id=session_id,
        case_id=case_id,
    )

    if case_id:
        try:
            saved_message = save_case_message(
                case_id=case_id,
                role="user",
                content=message,
                session_id=session_id,
            )
        except Exception as error:
            raise AgentMessagePersistenceError() from error

        if saved_message is None:
            raise AgentCaseNotFoundError()

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

    if case_id and final_response:
        try:
            saved_message = save_case_message(
                case_id=case_id,
                role="agent",
                content=final_response,
                session_id=session_id,
            )
        except Exception as error:
            raise AgentMessagePersistenceError() from error

        if saved_message is None:
            raise AgentMessagePersistenceError()

    return {
        "session_id": session_id,
        "response": final_response,
    }
