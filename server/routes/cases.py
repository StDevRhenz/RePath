from fastapi import APIRouter, HTTPException

from repath_agent.services.firestore_service import (
    FinalReviewError,
    complete_final_review,
    get_case,
    get_case_messages,
)


router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"],
)


@router.get("/{case_id}")
def read_case(case_id: str):
    case = get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found",
        )

    return case


@router.get("/{case_id}/messages")
def read_case_messages(case_id: str):
    try:
        messages = get_case_messages(case_id)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Failed to load case messages.",
        ) from error

    if messages is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found",
        )

    return {
        "case_id": case_id,
        "messages": messages,
    }


@router.post("/{case_id}/final-review")
def final_review_case(case_id: str):
    try:
        result = complete_final_review(case_id)
    except FinalReviewError as error:
        raise HTTPException(
            status_code=400,
            detail=error.message,
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Failed to complete final review.",
        ) from error

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found",
        )

    return result
