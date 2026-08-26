from fastapi import APIRouter, HTTPException

from repath_agent.services.firestore_service import get_case


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