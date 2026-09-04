from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from auth import get_current_user
from config import MAX_DOCUMENT_UPLOAD_SIZE_BYTES, UPLOAD_DIR
from repath_agent.services.firestore_service import (
    get_case,
    remove_case_document,
    update_case_documents_after_validation,
    upsert_case_document,
)

router = APIRouter(
    prefix="/api/cases",
    tags=["documents"],
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
}


@router.post("/{case_id}/documents")
async def upload_document(
    case_id: str,
    document_name: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    case = get_case(case_id)

    if case is None or case.get("owner_id") != user["uid"]:
        raise HTTPException(
            status_code=404,
            detail="Case not found.",
        )

    if case.get("status") == "ready_to_resubmit":
        raise HTTPException(
            status_code=400,
            detail="Recovery case is already ready for resubmission.",
        )

    if not _is_case_document_name(case, document_name):
        raise HTTPException(
            status_code=400,
            detail="This document is not part of the recovery case requirements.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must include a filename.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type.",
        )

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if len(contents) > MAX_DOCUMENT_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Uploaded file is too large.",
        )

    file_extension = Path(file.filename or "").suffix.lower()
    stored_file_name = f"{uuid4()}{file_extension}"

    case_upload_dir = UPLOAD_DIR / case_id
    case_upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_path = case_upload_dir / stored_file_name

    with open(file_path, "wb") as uploaded_file:
        uploaded_file.write(contents)

    document_data = {
        "document_name": document_name,
        "original_file_name": file.filename,
        "stored_file_name": stored_file_name,
        "content_type": file.content_type,
        "status": "uploaded",
        "validation_message": "",
        "validated_at": None,
    }

    try:
        saved_document = upsert_case_document(case_id, document_data)
    except Exception as error:
        _delete_stored_file(case_id, document_data)

        raise HTTPException(
            status_code=500,
            detail="Failed to update document metadata.",
        ) from error

    if saved_document is None:
        _delete_stored_file(case_id, document_data)

        raise HTTPException(
            status_code=404,
            detail="Recovery case not found.",
        )

    previous_document = _find_document(case, document_name)

    if previous_document is not None:
        _delete_stored_file(case_id, previous_document)

    return {
        "case_id": case_id,
        **document_data,
    }


@router.post("/{case_id}/documents/validate")
def validate_documents(case_id: str, user=Depends(get_current_user)):
    case = get_case(case_id)

    if case is None or case.get("owner_id") != user["uid"]:
        raise HTTPException(
            status_code=404,
            detail="Case not found.",
        )

    if case.get("status") == "ready_to_resubmit":
        raise HTTPException(
            status_code=400,
            detail="Recovery case is already ready for resubmission.",
        )

    documents = case.get("documents", [])

    if len(documents) == 0:
        raise HTTPException(
            status_code=404,
            detail="No uploaded documents found for this case.",
        )

    validated_at = datetime.now(timezone.utc)
    validation_results = [
        _validate_document(case_id, document, validated_at)
        for document in documents
    ]

    try:
        updated_case = update_case_documents_after_validation(
            case_id,
            validation_results,
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Failed to save document validation results.",
        ) from error

    if updated_case is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found.",
        )

    return {
        "case_id": case_id,
        "documents": validation_results,
    }


@router.get("/{case_id}/documents/{document_name}/file")
def get_document_file(case_id: str, document_name: str, user=Depends(get_current_user)):
    case = get_case(case_id)

    if case is None or case.get("owner_id") != user["uid"]:
        raise HTTPException(status_code=404, detail="Case not found.")

    document = _find_document(case, document_name)
    if document is None:
        raise HTTPException(status_code=404, detail="Uploaded document not found.")

    file_path = _get_document_path(case_id, document)
    if file_path is None or not file_path.exists():
        raise HTTPException(status_code=404, detail="Stored file could not be found.")

    return FileResponse(
        path=file_path,
        media_type=document.get("content_type") or "application/octet-stream",
        filename=document.get("original_file_name") or file_path.name,
    )


@router.delete("/{case_id}/documents/{document_name}")
def delete_document(
    case_id: str,
    document_name: str,
    user=Depends(get_current_user),
):
    case = get_case(case_id)

    if case is None or case.get("owner_id") != user["uid"]:
        raise HTTPException(
            status_code=404,
            detail="Case not found.",
        )

    if case.get("status") == "ready_to_resubmit":
        raise HTTPException(
            status_code=400,
            detail="Recovery case is already ready for resubmission.",
        )

    try:
        removed_document = remove_case_document(case_id, document_name)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Failed to remove document metadata.",
        ) from error

    if removed_document == {}:
        raise HTTPException(
            status_code=404,
            detail="Uploaded document not found.",
        )

    if removed_document is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found.",
        )

    _delete_stored_file(case_id, removed_document)

    return {
        "case_id": case_id,
        "document_name": document_name,
        "status": "removed",
    }


def _find_document(case: dict, document_name: str) -> dict | None:
    return next(
        (
            document
            for document in case.get("documents", [])
            if document.get("document_name") == document_name
        ),
        None,
    )


def _is_case_document_name(case: dict, document_name: str) -> bool:
    if document_name in case.get("missing_documents", []):
        return True

    if document_name in case.get("requirements", []):
        return True

    return _find_document(case, document_name) is not None


def _get_document_path(case_id: str, document: dict) -> Path | None:
    stored_file_name = document.get("stored_file_name")

    if not stored_file_name:
        return None

    return UPLOAD_DIR / case_id / Path(stored_file_name).name


def _delete_stored_file(case_id: str, document: dict) -> None:
    file_path = _get_document_path(case_id, document)

    if file_path is not None and file_path.exists():
        file_path.unlink()


def _validate_document(
    case_id: str,
    document: dict,
    validated_at: datetime,
) -> dict:
    document_name = document.get("document_name")

    if not document_name:
        return _validation_result(
            document,
            "needs_attention",
            "Document metadata is missing a document name.",
            validated_at,
        )

    if not document.get("stored_file_name"):
        return _validation_result(
            document,
            "needs_attention",
            "Document metadata is missing the stored file name.",
            validated_at,
        )

    if not document.get("original_file_name"):
        return _validation_result(
            document,
            "needs_attention",
            "Document metadata is missing the original file name.",
            validated_at,
        )

    if document.get("content_type") not in ALLOWED_CONTENT_TYPES:
        return _validation_result(
            document,
            "needs_attention",
            "Unsupported file type.",
            validated_at,
        )

    file_path = _get_document_path(case_id, document)

    if file_path is None or not file_path.exists():
        return _validation_result(
            document,
            "needs_attention",
            "Stored file could not be found.",
            validated_at,
        )

    if file_path.stat().st_size == 0:
        return _validation_result(
            document,
            "needs_attention",
            "Stored file is empty.",
            validated_at,
        )

    return _validation_result(
        document,
        "valid",
        "Document file is present and passed deterministic checks.",
        validated_at,
    )


def _validation_result(
    document: dict,
    status: str,
    validation_message: str,
    validated_at: datetime,
) -> dict:
    return {
        "document_name": document.get("document_name"),
        "original_file_name": document.get("original_file_name"),
        "stored_file_name": document.get("stored_file_name"),
        "content_type": document.get("content_type"),
        "status": status,
        "validation_message": validation_message,
        "validated_at": validated_at,
    }
