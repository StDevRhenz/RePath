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