You are continuing work on my existing RePath project.

Before changing anything, inspect the current repository and existing implementation.

Do NOT rebuild working features.
Do NOT modify Google ADK/Gemini.
Do NOT consume AI quota.
Do NOT refactor unrelated files.
Do NOT commit or push automatically.

CURRENT VERIFIED STATE

The document recovery lifecycle is already working end-to-end.

Current flow:

Missing
→ Uploading
→ Uploaded
→ Validate
→ Ready / Needs Attention

The backend already:
- stores uploaded files under server/uploads/{case_id}/
- stores document metadata in Firestore
- validates documents deterministically
- updates missing_documents
- moves the case to ready_for_review when no missing documents remain
- supports replace and remove
- keeps frontend and Firestore synchronized

The frontend workspace already has:
- Overview
- Documents
- Recovery
- Agent

Current verified case state after all documents are valid:

status = "ready_for_review"
missing_documents = []

Overview currently shows:
- Recovery progress: 75%
- Current status: Ready For Review
- No missing requirements

GOAL

Implement the next deterministic recovery stage:

ready_for_review
→ final review
→ ready_to_resubmit
→ 100%

This is NOT Gemini/AI validation yet.
This is an application-state final verification step.

IMPLEMENT THE FOLLOWING:

1. FINAL REVIEW BACKEND ENDPOINT

Create an endpoint such as:

POST /api/cases/{case_id}/final-review

The endpoint must:

- verify the recovery case exists
- verify current case status is appropriate for final review
- verify missing_documents is empty
- verify there is at least one required/expected document if the case workflow requires documents
- verify every uploaded recovery document is status == "valid"
- reject the transition if any document is:
  - uploaded
  - validating
  - needs_attention
  - missing from disk if the existing validation architecture makes this necessary
- do NOT trust the frontend to decide whether the case is complete

If all checks pass:

update case status to:

ready_to_resubmit

and update updated_at.

Return a clean response containing:
- case_id
- status
- message

Example:

{
  "case_id": "...",
  "status": "ready_to_resubmit",
  "message": "Recovery case passed final review and is ready for resubmission."
}

2. FIRESTORE SERVICE

Put the case state transition logic in an appropriate service function.

Avoid putting all Firestore logic directly inside the route.

Do not create a new status variant.

Use existing statuses only:

recovering
waiting_for_documents
ready_for_review
ready_to_resubmit

If older code contains waiting_for_user_documents, do not introduce more usage of it.

3. ERROR CASES

Return appropriate API errors for:

- case does not exist → 404
- case is not ready for final review → 400
- missing_documents is not empty → 400
- a required recovery document is not valid → 400
- invalid current state → 400
- persistence failure → 500

Return useful messages without leaking stack traces.

4. FRONTEND API SERVICE

Add an API function such as:

finalizeRecoveryCase(caseId)

Keep API calls in a service file, not directly inside the React component.

Use clear TypeScript response interfaces.

5. FRONTEND FINAL REVIEW ACTION

Decide the cleanest existing workspace location for the action.

Preferred behavior:

When case.status === "ready_for_review":

show a clear action such as:

"Complete final review"

or

"Review for resubmission"

Do NOT redesign the page.

The action should:
- call the backend final-review endpoint
- show a loading state
- disable while processing
- show errors cleanly
- refresh RecoveryCase after success

6. OVERVIEW STATE

After successful final review, the existing Overview should naturally show:

Recovery progress: 100%
Current status: Ready To Resubmit

Use the existing progress mapping if already present.

Do not hardcode a fake local success state if refreshing the Firestore-backed RecoveryCase already handles this.

7. RECOVERY SECTION

If appropriate and minimal, display that the recovery process is complete when status == ready_to_resubmit.

Do not redesign the whole section.

8. IMPORTANT BUSINESS RULE

ready_to_resubmit means:

RePath has verified that the recovery case is complete based on the current deterministic validation rules.

It does NOT mean:
- RePath submitted the application
- the external institution approved it
- the application is guaranteed to succeed

Keep wording accurate.

9. DO NOT IMPLEMENT YET

Do NOT add:
- automatic external submission
- browser automation
- Google ADK calls
- Gemini final review
- authentication
- deployment changes
- demo documents
- AgentSection integration
- unrelated UI polish

10. CODE QUALITY

Keep changes small and consistent with the existing architecture.

Reuse:
- get_case
- update_case
- existing Firestore patterns
- existing RecoveryCase frontend refresh logic

Do not duplicate existing utilities unnecessarily.

WHEN FINISHED

Do not commit or push.

Give me:
1. files changed
2. exact backend behavior
3. exact frontend behavior
4. state transition rules
5. limitations
6. manual test steps


IMPORTANT: do NOT commit or push automatically ILL CHECK ALL FILES 