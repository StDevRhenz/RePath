You are continuing work on my existing RePath project.

Before changing anything, inspect the repository and existing implementation.

Do NOT rebuild working features.
Do NOT modify document validation/final review unless necessary.
Do NOT consume Gemini requests during implementation/testing.
Do NOT commit or push automatically.
Do NOT refactor unrelated files.

CURRENT VERIFIED STATE

RePath already has:

Frontend:
- Landing
- New Recovery
- Resume Case
- Recovery Workspace
- Overview
- Documents
- Recovery
- Agent tab skeleton

Backend:
- FastAPI
- Firestore
- Google ADK
- Gemini agent
- persistent recovery cases
- document upload
- deterministic document validation
- replace/remove document lifecycle
- final review
- ready_to_resubmit state

Current recovery lifecycle works:

Rejected / incomplete
→ recovery case created
→ missing documents identified
→ documents uploaded
→ validated
→ ready_for_review
→ final review
→ ready_to_resubmit

IMPORTANT EXISTING AGENT ARCHITECTURE

There is already an agent API flow using:
- Google ADK Runner
- InMemorySessionService
- send_agent_message(...)
- POST /api/agent/message

The frontend already has:
- agentApi.ts
- RecoveryConversation.tsx
- NewRecoveryPage.tsx

The agent API returns:

{
  "session_id": "...",
  "response": "..."
}

Multi-turn messaging has already been tested successfully.

IMPORTANT:
session_id and case_id are DIFFERENT.

case_id = persistent Firestore recovery case
session_id = ADK conversation session

CURRENT PROBLEM

The Agent tab inside RecoveryWorkspace is intentionally disabled because a resumed Firestore case does not currently know which ADK session belongs to it.

GOAL

Make the Agent tab aware of the recovery case and able to continue the appropriate agent conversation.

However:
- do NOT call Gemini automatically on page load
- do NOT consume AI quota during development
- preserve the current mock-agent capability
- do not fake case/session relationships in the UI

IMPLEMENT THE FOLLOWING:

1. FIRESTORE CASE SESSION FIELD

Extend the recovery case model to support:

agent_session_id: string | null

New cases should initialize:

agent_session_id = null

Existing cases without this field must remain backward compatible.

2. LINK SESSION TO CASE

Create a backend service function that can persist:

case_id → agent_session_id

Do not let arbitrary unknown case IDs create new cases.

3. AGENT MESSAGE API

Extend the agent message flow so that it can optionally receive a case_id.

Preferred request shape:

{
  "message": "...",
  "session_id": "... or null",
  "case_id": "... or null"
}

Behavior:

A. If session_id is provided:
- continue that session

B. If no session_id is provided but case_id is provided:
- load the recovery case
- if case.agent_session_id exists, reuse it
- otherwise create a new ADK session and persist it to that case

C. If both are absent:
- preserve the existing new-conversation behavior

D. If case_id does not exist:
- return 404

Do not silently overwrite an existing case's session with an unrelated session unless there is a clear intended reason.

4. NEW CASE CREATION FLOW

Inspect the existing agent/tool workflow.

When the agent creates a persistent recovery case during a conversation, associate the current ADK session with that case if reasonably possible within the existing architecture.

Do not heavily redesign the agent tools if a smaller service-level solution works.

If automatic linkage during creation is difficult, document the limitation clearly and implement safe linkage when the case is first opened in the Agent tab.

5. AGENT TAB FRONTEND

Update AgentSection so it accepts the current RecoveryCase.

Replace the disabled placeholder with a real case-aware conversation UI.

It should:
- display messages
- allow user input
- send through agentApi
- pass recoveryCase.case_id
- reuse recoveryCase.agent_session_id when available
- show loading/thinking state
- show friendly API errors
- support Enter to send
- Shift+Enter for newline
- render markdown consistently with the existing RecoveryConversation component

Prefer reusing existing conversation/message rendering logic rather than duplicating large UI code.

6. MOCK MODE MUST STILL WORK

There is currently:

const USE_MOCK_AGENT = true

Do not remove this.

When mock mode is enabled:
- do not call FastAPI/Gemini
- Agent tab should still be usable for frontend development
- mock responses may be generic but must not pretend to have persisted a real ADK session unless explicitly represented as mock

When USE_MOCK_AGENT = false:
- real case/session API flow should work

7. RECOVERY CASE TYPE

Update frontend RecoveryCase type:

agent_session_id?: string | null

Backward compatibility is important because older Firestore cases may not have this field.

8. PERSISTENCE LIMITATION

Current backend uses InMemorySessionService.

Therefore ADK sessions disappear when backend restarts.

Do NOT solve full persistent ADK session storage in this task unless there is already a simple supported implementation in the codebase.

Instead:
- keep Firestore agent_session_id linkage
- handle missing/expired in-memory session gracefully
- document the limitation

If an existing stored session_id no longer exists in InMemorySessionService:
- create a fresh session safely
- update Firestore agent_session_id
- continue without crashing

9. ERROR HANDLING

Handle:
- nonexistent case
- expired/missing ADK session
- agent API failure
- Gemini 429 quota
- invalid request
- Firestore update failure

Do not expose stack traces or secrets.

10. DO NOT TOUCH

Do not modify:
- document upload architecture
- document validation behavior
- final review logic
- recovery progress logic
- Gemini model selection
- Google credentials
- deployment
- authentication
- demo documents
- unrelated styling

11. CODE QUALITY

Keep changes small.
Reuse:
- agentApi.ts
- RecoveryConversation patterns
- existing Firestore service
- existing RecoveryCase refresh logic
- existing shadcn/Textarea/Button components

Avoid duplicating markdown renderer or message UI if it can be extracted/reused cleanly.

Do not over-engineer.

WHEN FINISHED

Do not commit or push.

Give me:
1. files changed
2. backend session-linking behavior
3. frontend Agent tab behavior
4. how mock mode behaves
5. how expired sessions are handled
6. limitations
7. exact manual test steps


IMPORTANT: do NOT commit or push automatically ILL CHECK ALL FILES 