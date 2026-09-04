from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from repath_agent.services.firestore_service import delete_cases_by_owner


router = APIRouter(
    prefix="/api/account",
    tags=["account"],
)


@router.delete("")
def delete_account(user=Depends(get_current_user)):
    try:
        deletion_result = delete_cases_by_owner(user["uid"])
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete account data.",
        ) from error

    return {
        "status": "deleted",
        **deletion_result,
    }
