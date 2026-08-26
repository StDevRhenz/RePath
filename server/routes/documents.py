from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from repath_agent.services.firestore_service import add_case_document

router = APIRouter(
    prefix="/api/cases",
    tags=["documents"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/{case_id}/documents")
async def upload_document(
    case_id: str,
    document_name: str = Form(...),
    file: UploadFile = File(...),
):
    allowed_content_types = {
        "application/pdf",
        "image/png",
        "image/jpeg",
    }

    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type.",
        )

    file_extension = Path(file.filename or "").suffix.lower()
    stored_file_name = f"{uuid4()}{file_extension}"

    case_upload_dir = UPLOAD_DIR / case_id
    case_upload_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    file_path = case_upload_dir / stored_file_name

    contents = await file.read()

    with open(file_path, "wb") as uploaded_file:
        uploaded_file.write(contents)

    document_data = {
        "document_name": document_name,
        "original_file_name": file.filename,
        "stored_file_name": stored_file_name,
        "content_type": file.content_type,
        "status": "uploaded",
    }

    saved_document = add_case_document(case_id, document_data)

    if saved_document is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found.",
        )

    return {
        "case_id": case_id,
        **document_data,
    }