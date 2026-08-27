You are continuing work on my existing RePath project.

Before changing anything, inspect the repository and current implementation.

Do NOT rebuild working features.
Do NOT modify Gemini model configuration.
Do NOT consume Gemini requests during implementation/testing.
Do NOT commit or push automatically.
Do NOT redesign the UI.
Do NOT add demo/presentation content yet.

CURRENT VERIFIED STATE

RePath already has:

Frontend
- React + TypeScript + Vite
- Landing
- New Recovery
- Resume Case
- Recovery Workspace
- Documents lifecycle
- Agent tab
- persistent visible chat history
- mock mode

Backend
- FastAPI
- Firestore
- Google ADK
- persistent ADK sessions using DatabaseSessionService + SQLite
- document upload
- deterministic validation
- final review
- case-aware Agent responses
- robust error handling
- 10 MB upload limit

CURRENT GOAL

Make the project production/deployment ready without changing core product behavior.

IMPLEMENT A TARGETED PRODUCTION HARDENING PASS.

1. FRONTEND API CONFIG

Remove hardcoded API URLs such as:

http://127.0.0.1:8000

Use an environment-based frontend API URL:

VITE_API_URL

Create or update:
client/.env.example

Example:

VITE_API_URL=http://127.0.0.1:8000

Use a clean shared API base configuration if multiple service files currently duplicate the URL.

Do not expose secrets in frontend env.

2. BACKEND CONFIG

Centralize or cleanly load non-secret backend configuration where reasonable.

Support environment values for:

- Google Cloud project id
- allowed CORS origins
- max upload size
- ADK session DB URL
- upload directory if useful

Existing defaults for local development should remain safe.

Do not require production env just to run locally.

3. CORS

Replace hardcoded-only development CORS setup with env-configurable origins.

Suggested env:

ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

Behavior:
- parse comma-separated origins
- trim whitespace
- no wildcard when allow_credentials=True
- local development should still work

Do not enable overly permissive production CORS.

4. HEALTH ENDPOINT

Add:

GET /health

Return a small response such as:

{
  "status": "ok",
  "service": "repath-api"
}

Do not call Gemini or Firestore from the basic health endpoint unless there is a very strong reason.

5. PRODUCTION STARTUP

Make sure the backend has a production-safe startup command documented.

Development:

uvicorn main:app --reload

Production:

uvicorn main:app --host 0.0.0.0 --port <PORT>

Support cloud-provided PORT environment variable if practical.

Do not use --reload in production.

If a Procfile/render.yaml/etc. already exists, inspect it before modifying.

Do not introduce unnecessary deployment platforms.

6. RUNTIME STORAGE REVIEW

Current local runtime storage includes:

server/uploads/
server/data/adk_sessions.db

These are local filesystem storage.

Do NOT migrate them to cloud storage in this task.

Instead:
- keep them configurable where reasonable
- make sure directories are created safely
- keep them ignored by Git
- document that local disk may be ephemeral on cloud hosts

Add comments/documentation indicating that production deployment may need persistent disk or cloud storage later.

7. .GITIGNORE / SECRET HYGIENE

Verify these remain ignored:

.env
server/.env
server/.venv/
server/uploads/
server/data/
client/node_modules/
client/dist/

Do not commit API keys, credentials, service account files, uploaded documents, or SQLite runtime data.

8. ENV EXAMPLES

Update/create env example files.

Backend example should document non-secret config fields only.

Example concepts:

GOOGLE_CLOUD_PROJECT=repath-506704
ALLOWED_ORIGINS=http://localhost:5173
MAX_DOCUMENT_UPLOAD_SIZE_BYTES=10485760
ADK_SESSION_DB_URL=sqlite+aiosqlite:///./data/adk_sessions.db

Do not include real secrets.

Frontend example:

VITE_API_URL=http://127.0.0.1:8000

9. API SERVICE CLEANUP

If multiple frontend service files duplicate API URL constants, centralize them minimally.

For example:
src/lib/apiConfig.ts
or another clean existing location.

Do not over-refactor.

10. BACKEND ERROR SAFETY

Review production-facing responses.

Ensure:
- stack traces are not returned to frontend
- internal exception details stay server-side
- useful 400/404/413/429/500 responses remain

Do not remove useful existing error messages.

11. LOGGING

Keep logging simple.

Ensure:
- no secrets
- no file contents
- no full private documents
- no API keys

Do not introduce a heavy logging framework unless already present.

12. FIRESTORE / GOOGLE CONFIG

Do not change database schema.

Do not change authentication architecture.

Use environment project configuration instead of unnecessary hardcoding if it can be done safely without breaking local development.

13. FRONTEND BUILD

Ensure production frontend build works with environment-based API URL.

Do not change routing behavior.

14. DOCUMENTATION

Add a concise deployment/dev configuration note in an existing README or appropriate project markdown only if one exists and it can be done without rewriting the whole documentation.

Document:

Local frontend:
npm run dev

Local backend:
uvicorn main:app --reload

Production frontend:
npm run build

Production backend:
uvicorn main:app --host 0.0.0.0 --port $PORT

Required non-secret env configuration.

Mention that:
- uploads are local
- SQLite ADK session storage is local
- persistent cloud deployment may require persistent disk later

15. DO NOT TOUCH

Do NOT modify:
- document validation logic
- final review logic
- recovery status logic
- Agent instructions/tools
- Gemini model
- chat persistence design
- UI design/theme
- authentication
- demo documents
- presentation/video assets

16. VERIFICATION

Run:
- Python compile checks
- backend startup/import check if possible
- frontend build
- lint if configured
- git diff --check

Do not send Gemini requests.

WHEN FINISHED

Do not commit or push.

Give me:
1. files changed
2. frontend env/config behavior
3. backend env/config behavior
4. CORS behavior
5. health endpoint
6. production startup command
7. runtime storage limitations
8. security/gitignore checks
9. exact manual QA steps
10. confirm no Gemini requests were sent