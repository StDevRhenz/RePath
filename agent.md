You are continuing work on my existing RePath project.

Before changing anything, inspect the current repository and existing implementation.

Do NOT rebuild working features.
Do NOT modify document upload/validation/final review.
Do NOT modify Gemini model configuration.
Do NOT consume Gemini requests during implementation/testing.
Do NOT commit or push automatically.
Do NOT refactor unrelated files.

CURRENT VERIFIED STATE

RePath already has:
- persistent recovery cases in Firestore
- case_id
- agent_session_id linkage
- Agent tab messaging
- RecoveryConversation UI
- mock agent mode
- real backend agent API
- expired in-memory session recovery

Current limitation:

The visible Agent chat history is stored only in React state.

If the user:
- refreshes the browser
- leaves the recovery workspace
- comes back later

the visible previous messages disappear.

GOAL

Persist real Agent-tab chat history per recovery case in Firestore and reload it when the Agent tab is opened.

IMPORTANT:
Mock mode must remain local-only and must NOT save mock messages into Firestore.

IMPLEMENT THE FOLLOWING:

1. FIRESTORE MESSAGE STORAGE

Use a Firestore subcollection under each recovery case.

Preferred structure:

cases/{case_id}/messages/{message_id}

Each message should contain:

{
  "message_id": "...",
  "role": "user" | "agent",
  "content": "...",
  "created_at": timestamp
}

Optionally include:
- session_id
if useful for debugging/history, but do not make it required for rendering.

Do NOT store the entire chat history as one growing array inside the main case document.

2. FIRESTORE SERVICE FUNCTIONS

Add clear service functions such as:

save_case_message(...)
get_case_messages(...)

Behavior:
- verify case exists
- save messages under the correct case subcollection
- retrieve messages ordered by created_at ascending
- return clean serializable dictionaries
- do not expose Firestore internals to the route layer

3. MESSAGE API

Add an endpoint such as:

GET /api/cases/{case_id}/messages

It should:
- return 404 if case does not exist
- return an empty array if the case exists but has no messages
- return messages in chronological order

Preferred response:

{
  "case_id": "...",
  "messages": [
    {
      "message_id": "...",
      "role": "user",
      "content": "...",
      "created_at": "..."
    }
  ]
}

4. SAVE REAL AGENT MESSAGES

Integrate persistence into the existing real agent messaging flow.

When a real case-aware Agent message is sent:

- save the USER message
- send through the existing ADK/Gemini flow
- after successful Agent response, save the AGENT response

Important:
- only save messages when case_id is provided
- do not save generic agent conversations with no case_id unless existing architecture clearly requires it
- do not save mock messages
- do not save an Agent response if the request fails before one exists

If Gemini returns 429:
- user message may already have been persisted
- do not create a fake Agent response
- frontend should still handle the existing quota error normally

5. FRONTEND MESSAGE TYPE

Create/reuse a shared message interface.

Example:

type RecoveryMessage = {
  message_id?: string;
  role: "user" | "agent";
  content: string;
  created_at?: string;
};

Avoid having multiple incompatible message types across AgentSection and RecoveryConversation.

6. FRONTEND MESSAGE API

Add a service function such as:

getCaseMessages(caseId)

Keep API calls outside React components.

7. AGENT TAB INITIAL LOAD

When AgentSection opens for a real recovery case:

- load persisted messages from Firestore/backend
- show loading state if appropriate
- render existing history in chronological order
- if no messages exist, show the existing introductory empty state

Do NOT call Gemini when loading history.

8. REUSE RecoveryConversation

Reuse the existing RecoveryConversation rendering and input logic.

Allow it to accept optional initial/history messages.

Do not duplicate:
- markdown rendering
- thinking UI
- composer behavior
- Enter / Shift+Enter logic

9. MOCK MODE

USE_MOCK_AGENT = true must remain.

When mock mode is active:
- do not fetch Firestore chat history if that would confuse development
- do not persist mock messages
- mock conversation can remain local React state
- clearly keep mock session local-only

10. REFRESH BEHAVIOR

Expected real-mode behavior:

User sends:
"What should I do next?"

Agent replies.

Refresh browser.

Open Agent tab.

Expected:
- old user message appears
- old Agent response appears
- user can continue conversation

11. BACKEND RESTART LIMITATION

Current ADK still uses InMemorySessionService.

Chat history persistence is separate from ADK conversational memory.

If backend restarts:
- Firestore chat history should STILL render
- ADK may create a fresh session
- do not pretend the new ADK session has full hidden conversational memory just because visible messages exist

Do not solve persistent ADK session storage in this task.

12. DUPLICATE PROTECTION

Avoid obvious duplicate message writes caused by:
- frontend refresh
- React rerenders
- retry paths

Message saving should happen in the backend agent request lifecycle, not simply because a message is rendered.

13. ERROR HANDLING

Handle:
- unknown case → 404
- Firestore read/write failures → clean 500
- history load failure → frontend-friendly error
- malformed/empty messages
- Gemini 429 remains handled as before

Do not leak stack traces.

14. DO NOT TOUCH

Do NOT modify:
- document validation
- final review
- recovery progress
- status logic
- Agent model
- Google credentials
- authentication
- deployment
- demo documents
- unrelated styling

15. WHEN FINISHED

Do not commit or push.

Give me:
1. files changed
2. Firestore message structure
3. backend write/read behavior
4. frontend history loading behavior
5. mock mode behavior
6. limitations
7. exact manual test steps


IMPORTANT: do NOT commit or push automatically ILL CHECK ALL FILES 