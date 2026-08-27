from datetime import datetime, timezone
from uuid import uuid4

from google.cloud import firestore


db = firestore.Client(project="repath-506704")

CASES_COLLECTION = "cases"


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
