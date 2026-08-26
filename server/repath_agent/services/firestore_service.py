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