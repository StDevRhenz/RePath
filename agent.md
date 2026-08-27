You are continuing work on my existing RePath project.

Before changing anything, inspect the repository and existing implementation.

Do NOT rebuild working features.
Do NOT modify document upload/validation/final review.
Do NOT modify Gemini model configuration.
Do NOT consume Gemini requests during implementation/testing.
Do NOT commit or push automatically.
Do NOT refactor unrelated files.

CURRENT VERIFIED STATE

RePath already has:

Frontend:
- Recovery Workspace
- Agent tab
- case-aware Agent messaging
- persistent visible chat history
- mock mode
- friendly 429 handling

Backend:
- FastAPI
- Google ADK Runner
- InMemorySessionService
- case_id ↔ agent_session_id linkage
- Firestore chat history
- automatic fresh-session recovery if an in-memory session disappears

Current problem:

The actual ADK conversational session is still stored only in:

InMemorySessionService

Therefore when the backend restarts:
- Firestore chat history still renders
- agent_session_id still exists
- but ADK hidden conversation state is gone
- backend creates a new session

GOAL

Replace or augment the current in-memory ADK session handling with a persistent ADK-supported session strategy so conversation context survives backend restarts.

IMPORTANT:
Use Google ADK-supported persistence if available in the currently installed google-adk version.
Do NOT invent a custom fake ADK memory format if ADK already provides a supported persistent SessionService.

FIRST STEP

Before implementing:
1. inspect installed google-adk version and available session service classes
2. inspect the current agent_service.py architecture
3. choose the simplest officially supported persistent SessionService available in this environment

Prefer a supported database-backed SessionService if available.

Do NOT start by manually serializing hidden ADK session internals into Firestore.

IMPLEMENTATION REQUIREMENTS

1. PERSISTENT SESSION SERVICE

Replace:

InMemorySessionService

with the simplest appropriate persistent ADK SessionService supported by the installed version.

Potential examples may include database-backed session services, but VERIFY actual available APIs before using them.

Use a local development database if appropriate, such as SQLite, so we can prove persistence across backend restarts without adding unnecessary cloud infrastructure.

Keep the implementation easy to migrate later.

2. SESSION DATABASE LOCATION

If using SQLite or another local persistence file:

store it somewhere intentional under server data/runtime storage, for example:

server/data/adk_sessions.db

or another clean path.

Do not put generated runtime database files into Git.

Update .gitignore appropriately.

3. EXISTING SESSION LINKAGE

Preserve the existing Firestore field:

agent_session_id

Do not remove it.

Flow should remain:

case_id
→ Firestore agent_session_id
→ persistent ADK session store
→ continue same ADK session

4. EXISTING SESSION RECOVERY

If Firestore points to a session that truly does not exist in the persistent session store:

- create a fresh ADK session
- update agent_session_id
- continue safely

Do not crash.

5. BACKWARD COMPATIBILITY

Existing recovery cases may:
- have no agent_session_id
- have an agent_session_id created while InMemorySessionService was used
- point to a session that does not exist in the new persistent store

Handle all of these cases gracefully.

6. CHAT HISTORY

Do NOT replace Firestore chat-history persistence.

Firestore chat history and ADK session persistence serve different purposes:

Firestore messages:
- visible user/agent chat history

ADK session store:
- hidden agent conversational/session state

Keep both.

7. MOCK MODE

USE_MOCK_AGENT = true must remain completely unaffected.

Mock mode:
- must not create real ADK sessions
- must not touch persistent ADK session storage
- must not call Gemini

8. NO AUTOMATIC GEMINI TESTING

Do NOT send Gemini requests during implementation.

Static verification is enough:
- imports resolve
- server compiles
- application starts if possible
- session store can create/load a session without invoking Gemini

9. ERROR HANDLING

Handle:
- persistent session store initialization failure
- missing/expired session
- database file/path problems
- Firestore session-link update failure

Return clean errors.
Do not leak secrets or stack traces.

10. CONFIGURATION

Avoid hardcoding production-specific paths where possible.

If useful, introduce a small environment/config value such as:

ADK_SESSION_DB_URL

with a safe local development default.

Do not expose secrets.

11. DO NOT TOUCH

Do NOT modify:
- Gemini model
- Agent instructions/tools
- document flow
- final review
- recovery progress
- demo documents
- deployment architecture
- authentication
- unrelated UI

12. CODE QUALITY

Keep the change focused.

Prefer:
- one session service configuration point
- minimal changes to send_agent_message
- reuse existing case/session linking behavior

Do not over-engineer.

WHEN FINISHED

Do not commit or push.

Give me:
1. exact persistent SessionService chosen
2. why it is supported in our installed google-adk version
3. files changed
4. runtime data/database path
5. how existing agent_session_id linkage works now
6. how old in-memory-only session IDs are handled
7. .gitignore changes
8. limitations
9. exact manual test steps for:
   - create session
   - restart backend
   - reuse same session
10. no Gemini requests should be sent during implementation