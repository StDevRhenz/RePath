from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from repath_agent.services.firestore_service import (
    FinalReviewError,
    case_belongs_to_owner,
    complete_final_review,
    get_case,
    get_cases_by_owner,
    get_case_messages,
)


router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"],
)


@router.get("")
def read_my_cases(user=Depends(get_current_user)):
    return {
        "cases": get_cases_by_owner(user["uid"]),
    }


@router.get("/{case_id}")
def read_case(case_id: str, user=Depends(get_current_user)):
    case = get_case(case_id)

    if case is None or case.get("owner_id") != user["uid"]:
        raise HTTPException(
            status_code=404,
            detail="Case not found.",
        )

    return case


@router.get("/{case_id}/messages")
def read_case_messages(case_id: str, user=Depends(get_current_user)):
    if not case_belongs_to_owner(case_id, user["uid"]):
        raise HTTPException(
            status_code=404,
            detail="Case not found.",
        )

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
            detail="Case not found.",
        )

    return {
        "case_id": case_id,
        "messages": messages,
    }


@router.post("/{case_id}/final-review")
def final_review_case(case_id: str, user=Depends(get_current_user)):
    if not case_belongs_to_owner(case_id, user["uid"]):
        raise HTTPException(
            status_code=404,
            detail="Case not found.",
        )

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
            detail="Case not found.",
        )

    return result
