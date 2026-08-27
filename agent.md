Implement the authenticated My Recoveries dashboard flow for the existing RePath app.

Inspect the current repository first before changing anything.

Do NOT redesign backend auth.
Do NOT change Firebase provider configuration.
Do NOT change Gemini model/config.
Do NOT call Gemini.
Do NOT change document validation/final review logic.
Do NOT change ADK persistence/chat persistence architecture.
Do NOT commit or push automatically.

CURRENT VERIFIED STATE

Frontend:
- Firebase Google login works
- AuthContext persists auth state across refresh
- authFetch attaches Firebase Bearer token
- Google login/logout works
- hard refresh auth race is fixed

Backend:
- Firebase Admin verifies tokens
- cases have owner_id / owner_email
- protected endpoints enforce ownership
- GET /api/cases returns only the logged-in user’s cases
- wrong-owner case returns 404
- no token returns 401

CURRENT UX PROBLEM

The app still feels like a developer tool because users may need to:
- manually resume using raw Case ID
- see technical case IDs
- navigate through the old /resume flow

GOAL

Change the normal user flow to:

Landing
→ Continue with Google
→ My Recoveries dashboard
→ click a recovery
→ Recovery Workspace

The raw case_id should remain an internal identifier but should not be part of the normal user-facing experience.

IMPLEMENT

1. MY RECOVERIES PAGE

Create a page/route such as:

/recoveries

It should fetch:

GET /api/cases

using the existing authenticated case API/authFetch path.

Display only the current user’s cases.

Each recovery card/row should show user-friendly information such as:
- title
- friendly status label
- short progress/status text
- updated date if available

Do NOT prominently display raw case_id.

Clicking a recovery should navigate internally to:

/cases/{case_id}

The case_id can still be used in the route internally.

2. FRIENDLY STATUS COPY

Convert internal statuses to human-readable text.

Examples:

recovering
→ Recovery in progress

waiting_for_documents
→ Documents needed

ready_for_review
→ Ready for review

ready_to_resubmit
→ Ready for resubmission

Avoid exposing raw snake_case statuses.

3. EMPTY STATE

If the user has no recoveries, show a clean empty state such as:

“No recoveries yet.”

Include a clear primary action:
“Start a recovery”

which navigates to /new.

Keep copy simple and user-friendly.

4. LANDING PAGE AUTH FLOW

Use existing AuthContext.

If user is signed out:
- show “Continue with Google” as the main auth action
- keep the existing product explanation/hero

If user is already signed in:
- show a primary action such as “My Recoveries”
- optionally show a small account/logout control

Do not force signed-in users through the Case ID resume page.

5. POST-LOGIN NAVIGATION

After successful Google login:
- navigate to /recoveries

Do not just log to console.

Preserve clean error handling.

6. START RECOVERY FLOW

Authenticated users should be able to start a new recovery from:
- Landing
- My Recoveries dashboard

After a new case is created, preserve the existing workspace navigation behavior if already working.

Do not redesign the agent flow.

7. RESUME CASE PAGE

Keep the /resume route only if useful as a fallback/dev compatibility path.

It should no longer be the normal primary CTA.

Do not delete backend case_id support.

8. NAVIGATION

Update normal navigation so authenticated users can move between:
- My Recoveries
- Start recovery
- Logout

Keep it minimal.

Do not introduce a full complex sidebar unless one already exists.

9. USER-FRIENDLY CONTENT

Replace developer-ish visible wording where encountered in this flow.

Examples:

“Case ID”
→ hide from normal UX

“Resume a case”
→ “My Recoveries” or remove as primary CTA

“ready_to_resubmit”
→ “Ready for resubmission”

Keep the RePath tone:
- calm
- clear
- trustworthy
- professional
- not overly technical

10. AUTH LOADING STATE

Respect AuthContext loading.

Do not redirect/render the wrong logged-in/logged-out state while Firebase is still restoring auth.

Avoid flashing the signed-out landing UI for authenticated users during initialization if possible.

11. ACCESS BEHAVIOR

If an unauthenticated user tries to open /recoveries:
- redirect them to the landing/login flow

If an authenticated user opens /recoveries:
- load only their own cases

Do not change backend ownership behavior.

12. VISUAL STYLE

Keep current RePath visual identity:

- off-white #fafafa
- near-black text
- muted indigo accents
- Geist
- light/thin typography
- clean spacing
- subtle borders
- Lucide icons
- no gradients
- no glow
- no glassmorphism
- no flashy AI dashboard style

This task is structural UX, not the final polish pass.

13. DO NOT TOUCH

Do not modify:
- backend ownership model
- Firestore schema
- document lifecycle
- final review
- Agent tools/instructions
- Gemini model
- persistent ADK sessions
- visible chat history architecture
- demo/presentation assets

14. VERIFICATION

Do not call Gemini.

Run:
- frontend build
- lint if configured
- git diff --check

Manual QA targets:
- signed-out landing shows Google login
- login redirects to /recoveries
- /recoveries lists only owned cases
- case cards use friendly labels
- clicking a case opens workspace
- raw Case ID is not prominently shown
- empty state works
- start recovery works
- logout works
- hard refresh on /recoveries remains authenticated
- hard refresh on owned workspace still works
- unauthenticated /recoveries redirects appropriately

WHEN FINISHED

Do not commit or push.

Report:
1. files changed
2. new route(s)
3. dashboard behavior
4. login redirect behavior
5. how statuses are converted to friendly labels
6. whether /resume was kept and how
7. exact manual QA steps
8. confirm no Gemini requests were sent