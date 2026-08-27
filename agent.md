You are working on my existing RePath project.

Before changing anything, inspect the current repository structure and existing implementation. Do not rebuild or replace working features unnecessarily.

PROJECT CONTEXT

RePath is a recovery agent for rejected/incomplete applications.

Current stack:
- Frontend: React + TypeScript + Vite + Tailwind
- Backend: FastAPI + Python
- Database: Google Cloud Firestore
- AI agent: Google ADK / Gemini, but DO NOT modify the agent or consume Gemini quota for this task.

CURRENT WORKING FLOW

A recovery case already contains:
- case_id
- title
- status
- requirements
- submitted_documents
- missing_documents
- recovery_steps
- documents

The Documents frontend already supports:
- selecting PDF/PNG/JPG/JPEG
- real upload to FastAPI
- UI status:
  Missing → Uploading → Uploaded
- replacing/removing files locally
- a "Validate documents" button that currently uses MOCK validation

The backend already has:

POST /api/cases/{case_id}/documents

It:
1. receives multipart file + document_name
2. saves the actual file under:
   server/uploads/{case_id}/
3. creates document metadata
4. adds metadata to the Firestore case
5. returns HTTP 200

Firestore collection name is:
"cases"

Important existing service:
repath_agent/services/firestore_service.py

There is already:
- create_case()
- get_case()
- update_case()
- add_case_document()

Do not change the collection name.

GOAL

Replace the mock document validation with a real deterministic backend validation workflow.

IMPORTANT:
For this task, DO NOT use Gemini/ADK.
We only want the application architecture and lifecycle working first.

IMPLEMENT THE FOLLOWING

1. DOCUMENT VALIDATION ENDPOINT

Create an appropriate endpoint, preferably something like:

POST /api/cases/{case_id}/documents/validate

The endpoint should:
- verify that the case exists
- retrieve uploaded document metadata from Firestore
- verify that the corresponding stored file actually exists
- validate uploaded documents deterministically for now

For the current MVP validation, a document may be considered valid if:
- its uploaded file exists
- its content type is allowed
- file is not empty
- metadata is present

Return per-document validation results.

Use statuses such as:
- uploaded
- validating
- valid
- needs_attention

Do not pretend to semantically understand the PDF yet.

If validation cannot confirm the document, return needs_attention with a useful validation_message.

2. FIRESTORE VALIDATION STATE

Update the correct document entry inside the case's `documents` array.

Each stored document should support fields such as:

{
  "document_name": "...",
  "original_file_name": "...",
  "stored_file_name": "...",
  "content_type": "...",
  "status": "valid",
  "validation_message": "...",
  "validated_at": ...
}

Avoid simply appending duplicate versions of the same logical document.

Use document_name as the logical requirement identifier unless the existing architecture suggests a safer identifier.

3. FIX DOCUMENT REPLACEMENT

If the user uploads a replacement for the same document_name:
- replace/update the existing document metadata instead of continuously ArrayUnion-appending duplicates
- delete the old locally stored file if appropriate
- new document starts as "uploaded"

4. FIX DOCUMENT REMOVAL

Add backend support to remove an uploaded case document.

When removing:
- verify the case exists
- delete the physical file if it exists
- remove its Firestore document metadata
- the requirement should effectively return to missing/unresolved state

Expose an appropriate DELETE endpoint.

5. FRONTEND API SERVICE

Update/create the frontend document API service.

It should support:
- uploadCaseDocument(...)
- validateCaseDocuments(...)
- removeCaseDocument(...)

Keep API logic outside React components.

6. UPDATE DocumentsSection.tsx

Remove the fake 1.8-second validation.

"Validate documents" must call the real FastAPI validation endpoint.

Expected UI:

Missing
→ Uploading...
→ Uploaded
→ Validating...
→ Ready

or

Missing
→ Uploading...
→ Uploaded
→ Validating...
→ Needs Attention

Display backend validation_message when a document needs attention.

Replace must use the real backend lifecycle.

Remove must use the real backend DELETE endpoint.

Do not rely only on local React state as the source of truth after an API response.

7. KEEP WORKSPACE STATE CONSISTENT

After upload / validation / remove:
- refresh or update the RecoveryCase data so Firestore-backed state is reflected
- Documents and Overview should not permanently contradict each other

However, do not redesign the entire workspace.

8. STATUS HANDLING

Inspect existing status values before changing them.

Known statuses include:
- recovering
- waiting_for_documents
- ready_for_review
- ready_to_resubmit

There has previously been a mismatch with:
waiting_for_user_documents

Do not create additional inconsistent variants.

If all currently missing required documents have valid uploaded replacements, the case may move toward `ready_for_review`.

Do NOT implement final ready_to_resubmit logic yet unless it already exists.

9. ERROR HANDLING

Handle:
- nonexistent case → 404
- nonexistent uploaded document
- unsupported type
- empty file
- missing local file
- Firestore failure
- failed frontend requests

Avoid leaking stack traces or secrets to the frontend.

10. SECURITY / REPOSITORY HYGIENE

Do not commit or expose:
- .env
- API keys
- credentials
- server/uploads contents

server/uploads/ should remain ignored by Git.

11. DO NOT TOUCH

Do not modify:
- Google ADK agent behavior
- Gemini model configuration
- mock Agent API setting
- AgentSection
- demo documents
- authentication
- deployment
- unrelated UI
- overall design/theme

12. CODE QUALITY

Reuse existing project patterns.
Keep route code thin where reasonable.
Put Firestore/document persistence logic in services rather than duplicating it across routes.
Use clear TypeScript interfaces for API responses.
Do not over-engineer.

WHEN FINISHED

Do not blindly refactor unrelated files.

Give me:
1. summary of files changed
2. exact behavior implemented
3. any architectural decisions made
4. any remaining limitations
5. exact manual testing steps I should perform


IMPORTANT: do NOT commit or push automatically ILL CHECK ALL FILES 