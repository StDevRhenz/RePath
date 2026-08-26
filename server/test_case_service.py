from repath_agent.services.firestore_service import (
    create_case,
    get_case,
    update_case,
)


case = create_case("Scholarship Application 2026")

print("CREATED:")
print(case)

case_id = case["case_id"]

updated_case = update_case(
    case_id,
    {
        "status": "waiting_for_documents",
        "missing_documents": [
            "Recommendation Letter",
            "Enrollment Certificate",
        ],
    },
)

print("\nUPDATED:")
print(updated_case)

loaded_case = get_case(case_id)

print("\nLOADED:")
print(loaded_case)