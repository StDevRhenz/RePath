from .services.firestore_service import (
    create_case,
    get_case,
    update_case,
)



def create_recovery_case(title: str) -> dict:
    """
    Create a persistent recovery case.

    Args:
        title: A short descriptive title for the application case.

    Returns:
        The newly created recovery case.
    """

    case = create_case(title)

    return {
        "status": "case_created",
        "case_id": case["case_id"],
        "title": case["title"],
        "case_status": case["status"],
    }


def update_recovery_case(
    case_id: str,
    status: str,
    missing_documents: list[str],
    recovery_steps: list[str],
) -> dict:
    """
    Save the current recovery progress to an existing case.

    Args:
        case_id: The ID of the recovery case.
        status: Current state of the recovery workflow.
        missing_documents: Documents still required from the user.
        recovery_steps: Actions required to recover the application.

    Returns:
        The updated recovery case information.
    """

    updated_case = update_case(
        case_id,
        {
            "status": status,
            "missing_documents": missing_documents,
            "recovery_steps": recovery_steps,
        },
    )

    if updated_case is None:
        return {
            "status": "error",
            "message": "Recovery case not found.",
        }

    return {
        "status": "case_updated",
        "case_id": case_id,
        "case_status": updated_case["status"],
        "missing_documents": updated_case["missing_documents"],
        "recovery_steps": updated_case["recovery_steps"],
    }


def load_recovery_case(case_id: str) -> dict:
    """
    Load a previously saved recovery case.

    Args:
        case_id: The ID of the recovery case to retrieve.

    Returns:
        The persisted recovery case.
    """

    case = get_case(case_id)

    if case is None:
        return {
            "status": "error",
            "message": "Recovery case not found.",
        }

    return {
        "status": "case_loaded",
        "case_id": case["case_id"],
        "title": case["title"],
        "case_status": case["status"],
        "requirements": case["requirements"],
        "submitted_documents": case["submitted_documents"],
        "missing_documents": case["missing_documents"],
        "recovery_steps": case["recovery_steps"],
    }


def analyze_rejection(rejection_text: str) -> dict:
    """
    Analyze a rejection notice and record the initial
    rejection information for the recovery workflow.

    Args:
        rejection_text: The rejection notice or feedback
        received by the applicant.

    Returns:
        Structured information about the rejection.
    """

    return {
        "status": "analyzed",
        "rejection_text": rejection_text,
        "next_action": "check_application_requirements",
    }

def extract_requirements(requirements_text: str) -> dict:
    """
    Extract application requirements from requirement text.

    Args:
        requirements_text: The official requirements provided
        for the application.

    Returns:
        Structured information containing the requirements.
    """

    return {
        "status": "extracted",
        "requirements_text": requirements_text,
        "next_action": "validate_submitted_documents",
    }

def validate_documents(
    required_documents: list[str],
    submitted_documents: list[str],
) -> dict:
    """
    Compare required application documents with the documents
    submitted by the applicant.

    Args:
        required_documents: Documents required by the application.
        submitted_documents: Documents submitted by the applicant.

    Returns:
        Validation results including missing documents.
    """

    required_normalized = {
        document.strip().lower(): document
        for document in required_documents
    }

    submitted_normalized = {
        document.strip().lower()
        for document in submitted_documents
    }

    missing_documents = [
        original_name
        for normalized_name, original_name in required_normalized.items()
        if normalized_name not in submitted_normalized
    ]

    return {
        "status": "validated",
        "required_count": len(required_documents),
        "submitted_count": len(submitted_documents),
        "missing_documents": missing_documents,
        "missing_count": len(missing_documents),
        "next_action": (
            "create_recovery_plan"
            if missing_documents
            else "verify_application"
        ),
    }


def create_recovery_plan(missing_documents: list[str]) -> dict:
    """
    Create recovery steps for missing application documents.

    Args:
        missing_documents: Required documents that are currently missing.

    Returns:
        A structured recovery plan.
    """

    recovery_steps = [
        {
            "document": document,
            "action": f"Provide {document}",
            "status": "waiting_for_user",
        }
        for document in missing_documents
    ]

    recovery_steps.append(
        {
            "action": "Revalidate the complete application",
            "status": "blocked",
        }
    )

    return {
        "status": "recovery_plan_created",
        "steps": recovery_steps,
        "waiting_for": missing_documents,
        "next_action": "wait_for_required_documents",
    }