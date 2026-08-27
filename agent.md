You are continuing work on my existing RePath project.

Before changing anything, inspect the repository and current implementation.

Do NOT rebuild working features.
Do NOT modify Gemini model configuration.
Do NOT consume Gemini requests during implementation/testing.
Do NOT commit or push automatically.
Do NOT refactor unrelated files.
Do NOT add demo/presentation content yet.

CURRENT VERIFIED STATE

RePath already has:

Frontend
- Landing
- New Recovery
- Resume Case
- Recovery Workspace
- Overview
- Documents
- Recovery
- Agent tab
- persistent visible Agent chat history
- mock Agent mode

Backend
- FastAPI
- Firestore
- Google ADK
- persistent recovery cases
- document upload
- replace/remove lifecycle
- deterministic document validation
- final review
- ready_to_resubmit state
- case_id ↔ agent_session_id linkage
- persistent ADK session storage using DatabaseSessionService
- Firestore-backed visible chat history

Current goal:

Perform a targeted edge-case / robustness pass on existing functionality.

Do NOT add major new features.

TEST AND FIX THESE AREAS

1. INVALID CASE IDs

Check all relevant endpoints and pages for:
- missing case_id
- malformed/nonexistent case_id
- case removed from Firestore while page is open

Expected:
- clean 404 or friendly frontend error
- no uncaught crash

2. DOCUMENT UPLOAD EDGE CASES

Check:
- unsupported MIME type
- empty file
- missing filename
- missing document_name
- arbitrary document_name not part of the case
- duplicate rapid upload requests
- replace while a previous upload is still in progress
- large files

Add a sensible backend file-size limit if none exists.

Recommended:
- define a configurable max size
- default around 10 MB for MVP
- return HTTP 413 for oversized files

Do not consume Gemini.

3. DOCUMENT VALIDATION EDGE CASES

Check:
- Firestore metadata exists but local physical file is missing
- empty physical file
- unsupported stored content type
- validation called with no uploaded documents
- validation called twice quickly
- validation called after case is already ready_for_review or ready_to_resubmit

Expected:
- clean statuses/errors
- no duplicate state corruption

4. DOCUMENT REMOVE / REPLACE

Check:
- remove document that does not exist
- remove while another request is active
- replace a valid document
- replacing should return it to uploaded/unvalidated state
- old physical file should be removed
- Firestore should contain only one logical document per document_name

5. FINAL REVIEW EDGE CASES

Check:
- final review while case is not ready_for_review
- missing_documents not empty
- one document not valid
- stored file missing
- final review called twice
- final review after ready_to_resubmit

Expected:
- reject invalid transitions
- no duplicate/incorrect state changes
- useful error messages

6. AGENT API EDGE CASES

Do NOT send real Gemini requests.

Review handling for:
- no message
- blank/whitespace-only message
- unknown case_id
- stale agent_session_id
- persistent session DB unavailable
- Firestore session-link failure
- Gemini 429
- generic backend agent failure

Frontend should show useful errors and remain usable.

7. CHAT HISTORY EDGE CASES

Check:
- no messages
- only user message exists because Gemini failed
- duplicate save attempts
- message ordering
- refresh while history is loading
- unknown case
- Firestore read failure

Do not persist mock messages.

8. RAPID / DUPLICATE USER ACTIONS

Inspect UI buttons for accidental double submission.

Important actions:
- Continue
- Add/Replace document
- Validate documents
- Remove
- Complete final review
- Agent send

Buttons should be disabled appropriately while request is active.

Avoid duplicate API writes.

9. REFRESH DURING REQUEST

Review what happens if user refreshes while:
- upload is running
- validation is running
- final review is running
- Agent request is running

Do not add complicated recovery infrastructure.

Just make sure persisted backend state remains authoritative and page reload does not corrupt state.

10. FRONTEND ERROR STATES

Make sure errors:
- are readable
- do not expose stack traces
- do not leave buttons permanently disabled
- can recover after retry where appropriate

11. FIRESTORE CONSISTENCY

Review:
- missing_documents
- documents
- status
- agent_session_id

Make sure existing mutations cannot obviously produce contradictory case state.

Do not redesign the schema.

12. SECURITY / HYGIENE

Verify:
- .env ignored
- uploads ignored
- ADK SQLite runtime DB ignored
- no secrets logged
- user filenames are not used directly as filesystem paths
- stored filenames remain sanitized/randomized

13. DO NOT TOUCH

Do not modify:
- core Agent instructions
- Gemini model
- deployment architecture
- authentication
- demo documents
- overall design/theme
- unrelated components

14. VERIFICATION

Run:
- Python compile checks
- frontend build
- lint if already configured
- git diff --check

Do not send Gemini requests.

WHEN FINISHED

Do not commit or push.

Give me:
1. files changed
2. edge cases found
3. edge cases fixed
4. behavior changes
5. any intentionally deferred issues
6. exact manual QA checklist
7. confirm no Gemini requests were sent