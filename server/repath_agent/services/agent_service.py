import uuid
from contextlib import nullcontext

from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types

from config import ADK_SESSION_DB_URL, DEFAULT_ADK_SESSION_DB_PATH
from repath_agent.agent import root_agent
from repath_agent.services.firestore_service import (
    case_owner_context,
    get_case,
    get_case_for_owner,
    link_case_agent_session,
    save_case_message,
)

load_dotenv()

APP_NAME = "repath_agent"
USER_ID = "repath_user"

DEFAULT_ADK_SESSION_DB_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

try:
    session_service = DatabaseSessionService(
        db_url=ADK_SESSION_DB_URL,
    )

    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )
except Exception as error:
    session_service = None
    runner = None
    session_service_error = error
else:
    session_service_error = None


class AgentCaseNotFoundError(Exception):
    pass


class AgentSessionLinkError(Exception):
    pass


class AgentMessagePersistenceError(Exception):
    pass


class AgentSessionStoreError(Exception):
    pass


async def create_agent_session() -> str:
    ensure_session_store_ready()

    session_id = str(uuid.uuid4())

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )

    return session_id


async def get_agent_session(session_id: str):
    ensure_session_store_ready()

    return await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )


async def resolve_agent_session(
    session_id: str | None = None,
    case_id: str | None = None,
    owner_id: str | None = None,
) -> str:
    case = None

    if case_id:
        case = (
            get_case_for_owner(case_id, owner_id)
            if owner_id
            else get_case(case_id)
        )

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
    owner_id: str | None = None,
    owner_email: str | None = None,
) -> dict:
    ensure_session_store_ready()

    session_id = await resolve_agent_session(
        session_id=session_id,
        case_id=case_id,
        owner_id=owner_id,
    )

    recovery_case = None

    if case_id:
        recovery_case = (
            get_case_for_owner(case_id, owner_id)
            if owner_id
            else get_case(case_id)
        )

        if recovery_case is None:
            raise AgentCaseNotFoundError()

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

    agent_message = (
        build_case_context_message(recovery_case, message)
        if recovery_case
        else message
    )

    content = types.Content(
        role="user",
        parts=[
            types.Part(text=agent_message),
        ],
    )

    final_response = ""

    owner_context = (
        case_owner_context(owner_id, owner_email)
        if owner_id
        else nullcontext()
    )

    with owner_context:
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


def ensure_session_store_ready() -> None:
    if session_service_error is not None or session_service is None or runner is None:
        raise AgentSessionStoreError() from session_service_error


def build_case_context_message(
    recovery_case: dict,
    user_message: str,
) -> str:
    missing_documents = recovery_case.get("missing_documents", [])
    recovery_steps = recovery_case.get("recovery_steps", [])
    documents = recovery_case.get("documents", [])

    document_statuses = [
        (
            f"- {document.get('document_name', 'Unnamed document')}: "
            f"{document.get('status', 'unknown')}"
        )
        for document in documents
    ]

    context_lines = [
        "Current RePath recovery case context:",
        f"- case_id: {recovery_case.get('case_id')}",
        f"- title: {recovery_case.get('title')}",
        f"- status: {recovery_case.get('status')}",
        "- missing_documents: "
        + (", ".join(missing_documents) if missing_documents else "none"),
        "Recovery steps:",
        *[
            f"- {step}"
            for step in recovery_steps[:8]
        ],
    ]

    if not recovery_steps:
        context_lines.append("- none recorded")

    context_lines.extend([
        "Uploaded recovery document statuses:",
        *(document_statuses[:10] or ["- none uploaded"]),
        "",
        "Instruction for this turn:",
        "This is an existing recovery case. Do not ask the user for the Case ID.",
        "Do not restart onboarding or ask for the rejection notice unless it is directly needed.",
        "Answer in relation to the current recovery case status and next steps.",
        "Do not claim the application was submitted, approved, or guaranteed.",
        "",
        "User message:",
        user_message,
    ])

    return "\n".join(context_lines)
