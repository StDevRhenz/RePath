from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from google.cloud import firestore


db = firestore.Client(project="repath-506704")

CASES_COLLECTION = "cases"
UPLOAD_DIR = Path("uploads")


class FinalReviewError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def create_case(title: str) -> dict:
    case_id = str(uuid4())

    case_data = {
        "case_id": case_id,
        "title": title,
        "status": "recovering",
        "requirements": [],
        "submitted_documents": [],
        "missing_documents": [],
        "recovery_steps": [],
        "documents": [],
        "agent_session_id": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    db.collection(CASES_COLLECTION).document(case_id).set(case_data)

    return case_data


def get_case(case_id: str) -> dict | None:
    document = (
        db.collection(CASES_COLLECTION)
        .document(case_id)
        .get()
    )

    if not document.exists:
        return None

    return document.to_dict()


def update_case(case_id: str, updates: dict) -> dict | None:
    case_ref = db.collection(CASES_COLLECTION).document(case_id)

    document = case_ref.get()

    if not document.exists:
        return None

    updates["updated_at"] = datetime.now(timezone.utc)

    case_ref.update(updates)

    updated_document = case_ref.get()

    return updated_document.to_dict()


def link_case_agent_session(
    case_id: str,
    agent_session_id: str,
) -> dict | None:
    return update_case(
        case_id,
        {
            "agent_session_id": agent_session_id,
        },
    )


def save_case_message(
    case_id: str,
    role: str,
    content: str,
    session_id: str | None = None,
) -> dict | None:
    if role not in {"user", "agent"}:
        raise ValueError("Invalid message role.")

    if not content.strip():
        raise ValueError("Message content cannot be empty.")

    case_ref = db.collection(CASES_COLLECTION).document(case_id)
    case_document = case_ref.get()

    if not case_document.exists:
        return None

    message_id = str(uuid4())
    created_at = datetime.now(timezone.utc)

    message = {
        "message_id": message_id,
        "role": role,
        "content": content,
        "created_at": created_at,
    }

    if session_id:
        message["session_id"] = session_id

    (
        case_ref
        .collection("messages")
        .document(message_id)
        .set(message)
    )

    return _serialize_case_message(message)


def get_case_messages(case_id: str) -> list[dict] | None:
    case_ref = db.collection(CASES_COLLECTION).document(case_id)
    case_document = case_ref.get()

    if not case_document.exists:
        return None

    messages = (
        case_ref
        .collection("messages")
        .order_by("created_at")
        .stream()
    )

    return [
        _serialize_case_message(message.to_dict())
        for message in messages
    ]


def _serialize_case_message(message: dict) -> dict:
    serialized_message = {
        "message_id": message.get("message_id"),
        "role": message.get("role"),
        "content": message.get("content"),
        "created_at": _serialize_datetime(message.get("created_at")),
    }

    if message.get("session_id"):
        serialized_message["session_id"] = message.get("session_id")

    return serialized_message


def _serialize_datetime(value):
    if isinstance(value, datetime):
        return value.isoformat()

    return value


def add_case_document(case_id: str, document: dict):
    case_ref = db.collection(CASES_COLLECTION).document(case_id)

    existing_case = case_ref.get()

    if not existing_case.exists:
        return None

    case_ref.update({
        "documents": firestore.ArrayUnion([document]),
        "updated_at": datetime.now(timezone.utc),
    })

    return document


def upsert_case_document(case_id: str, document: dict) -> dict | None:
    case_ref = db.collection(CASES_COLLECTION).document(case_id)

    existing_case = case_ref.get()

    if not existing_case.exists:
        return None

    case_data = existing_case.to_dict()
    documents = case_data.get("documents", [])

    updated_documents = [
        current_document
        for current_document in documents
        if current_document.get("document_name") != document.get("document_name")
    ]

    updated_documents.append(document)

    document_name = document.get("document_name")
    updated_missing_documents = case_data.get("missing_documents", [])
    known_document_names = {
        *case_data.get("requirements", []),
        *updated_missing_documents,
        *[
            current_document.get("document_name")
            for current_document in documents
        ],
    }

    if (
        document_name
        and document_name in known_document_names
        and document_name not in updated_missing_documents
    ):
        updated_missing_documents = [
            *updated_missing_documents,
            document_name,
        ]

    updates = {
        "documents": updated_documents,
        "missing_documents": updated_missing_documents,
        "updated_at": datetime.now(timezone.utc),
    }

    if case_data.get("status") == "ready_for_review":
        updates["status"] = "waiting_for_documents"

    case_ref.update(updates)

    return document


def remove_case_document(case_id: str, document_name: str) -> dict | None:
    case_ref = db.collection(CASES_COLLECTION).document(case_id)

    existing_case = case_ref.get()

    if not existing_case.exists:
        return None

    case_data = existing_case.to_dict()
    documents = case_data.get("documents", [])

    document_to_remove = next(
        (
            current_document
            for current_document in documents
            if current_document.get("document_name") == document_name
        ),
        None,
    )

    if document_to_remove is None:
        return {}

    updated_missing_documents = case_data.get("missing_documents", [])

    if document_name not in updated_missing_documents:
        updated_missing_documents = [
            *updated_missing_documents,
            document_name,
        ]

    case_ref.update({
        "documents": [
            current_document
            for current_document in documents
            if current_document.get("document_name") != document_name
        ],
        "missing_documents": updated_missing_documents,
        "status": "waiting_for_documents",
        "updated_at": datetime.now(timezone.utc),
    })

    return document_to_remove


def update_case_documents_after_validation(
    case_id: str,
    validation_results: list[dict],
) -> dict | None:
    case_ref = db.collection(CASES_COLLECTION).document(case_id)

    existing_case = case_ref.get()

    if not existing_case.exists:
        return None

    case_data = existing_case.to_dict()
    documents = case_data.get("documents", [])
    result_by_document_name = {
        result["document_name"]: result
        for result in validation_results
    }

    updated_documents = []

    for document in documents:
        document_name = document.get("document_name")
        validation_result = result_by_document_name.get(document_name)

        if validation_result is None:
            updated_documents.append(document)
            continue

        updated_documents.append({
            **document,
            "status": validation_result["status"],
            "validation_message": validation_result["validation_message"],
            "validated_at": validation_result["validated_at"],
        })

    valid_document_names = {
        result["document_name"]
        for result in validation_results
        if result["status"] == "valid"
    }

    updated_missing_documents = [
        document_name
        for document_name in case_data.get("missing_documents", [])
        if document_name not in valid_document_names
    ]

    for result in validation_results:
        document_name = result["document_name"]

        if (
            result["status"] == "needs_attention"
            and document_name
            and document_name not in updated_missing_documents
        ):
            updated_missing_documents.append(document_name)

    updates = {
        "documents": updated_documents,
        "missing_documents": updated_missing_documents,
        "updated_at": datetime.now(timezone.utc),
    }

    if len(updated_missing_documents) == 0:
        updates["status"] = "ready_for_review"
    elif case_data.get("status") == "ready_for_review":
        updates["status"] = "waiting_for_documents"

    case_ref.update(updates)

    updated_case = case_ref.get()

    return updated_case.to_dict()


def complete_final_review(case_id: str) -> dict | None:
    case_ref = db.collection(CASES_COLLECTION).document(case_id)

    document = case_ref.get()

    if not document.exists:
        return None

    case_data = document.to_dict()

    _verify_case_ready_for_final_review(case_id, case_data)

    case_ref.update({
        "status": "ready_to_resubmit",
        "updated_at": datetime.now(timezone.utc),
    })

    return {
        "case_id": case_id,
        "status": "ready_to_resubmit",
        "message": (
            "Recovery case passed final review and is ready for resubmission."
        ),
    }


def _verify_case_ready_for_final_review(
    case_id: str,
    case_data: dict,
) -> None:
    status = case_data.get("status")

    if status == "ready_to_resubmit":
        raise FinalReviewError(
            "Recovery case has already passed final review."
        )

    if status != "ready_for_review":
        raise FinalReviewError(
            "Recovery case is not ready for final review."
        )

    missing_documents = case_data.get("missing_documents", [])

    if len(missing_documents) > 0:
        raise FinalReviewError(
            "Recovery case still has missing documents."
        )

    documents = case_data.get("documents", [])

    if len(documents) == 0:
        raise FinalReviewError(
            "Recovery case has no required recovery documents to review."
        )

    for recovery_document in documents:
        document_name = (
            recovery_document.get("document_name")
            or "Recovery document"
        )

        if recovery_document.get("status") != "valid":
            raise FinalReviewError(
                f"{document_name} has not passed document validation."
            )

        stored_file_name = recovery_document.get("stored_file_name")

        if not stored_file_name:
            raise FinalReviewError(
                f"{document_name} is missing stored file metadata."
            )

        file_path = UPLOAD_DIR / case_id / Path(stored_file_name).name

        if not file_path.exists():
            raise FinalReviewError(
                f"{document_name} stored file could not be found."
            )
