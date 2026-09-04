Implement the final UI/UX polish pass for the existing RePath frontend based on the completed audit.

IMPORTANT
- Inspect the current frontend first.
- Do NOT add new product features.
- Do NOT redesign the product from scratch.
- Do NOT modify backend logic.
- Do NOT modify Firebase auth architecture.
- Do NOT modify Gemini/ADK behavior.
- Do NOT call Gemini.
- Do NOT commit or push automatically.

PRODUCT IDENTITY

RePath is a recovery assistant for rejected, incomplete, or stalled document-based applications.

Keep the current visual identity:
- off-white #fafafa
- near-black text
- restrained indigo accents
- Geist typography
- light/thin weights
- Lucide icons
- subtle borders
- generous whitespace
- calm civic-tech / productivity SaaS feel
- no gradients
- no glow
- no glassmorphism
- no flashy AI-chatbot aesthetic
- no emojis in product UI

PRIMARY GOAL

Make the current working product feel:
- understandable to non-technical users
- calm
- trustworthy
- accessible
- consistent
- production-ready

Use:
- Nielsen usability heuristics
- WCAG 2.2
- ISO 9241 usability principles

DO NOT add features.

IMPLEMENT THESE CHANGES

1. REMOVE DEVELOPER / INTERNAL WORDING

Replace user-facing technical language.

Examples:

"deterministic review"
→ "final check" or "readiness check"

"Complete a final deterministic review before this recovery case is marked ready for resubmission."
→ "Check that the required documents are ready before marking this recovery for resubmission."

"Recovery is complete based on the current deterministic review rules and is ready for resubmission."
→ "This recovery is ready for resubmission based on the documents currently in this case."

"real agent API"
→ user-facing wording about the recovery/conversation

"Messages are linked to this recovery case when the real agent API is enabled."
→ "Messages in this conversation stay connected to this recovery."

"FastAPI or Gemini"
→ remove from normal user-facing copy

Mock/development-specific implementation details should not appear in normal product UX.

2. FINAL REVIEW COPY

Use user-friendly terminology.

Prefer:
"Check readiness"

instead of:
"Complete final review"

Keep the meaning accurate.

Do NOT claim:
- submitted
- approved
- accepted by external institution
- guaranteed success

Ready to resubmit means only that RePath's current recovery checks are complete.

3. DOCUMENT STATUS COPY

Replace ambiguous/internal status labels.

Suggested:

valid
→ "Accepted"

uploaded
→ "Uploaded, needs check"

validating
→ "Checking..."

needs_attention
→ "Needs a fix"

missing
→ "Missing"

Also change:

"Validate documents"
→ "Check documents"

"No missing documents recorded."
→ "No documents are missing right now."

"No missing requirements recorded."
→ "No requirements are missing right now."

Ensure status wording is consistent across the app.

4. SHARED STATUS LABELS

There is duplicated status formatting across:
- RecoveriesPage
- RecoveryWorkspacePage
- OverviewSection
and possibly other components.

Create one minimal shared helper/constant for case status labels.

Expected labels:

recovering
→ "Recovery in progress"

waiting_for_documents
→ "Documents needed"

ready_for_review
→ "Ready for review"

ready_to_resubmit
→ "Ready for resubmission"

Avoid exposing raw snake_case values.

Do not over-refactor.

5. RECOVERY WORKSPACE ERROR FLOW

If an authenticated user cannot load a recovery:

Do NOT send them back to the legacy /resume Case ID flow.

Change normal recovery error action to:

"Back to recoveries"

and navigate to:

/recoveries

Keep /resume only as fallback compatibility if it already exists.

6. LEGACY /RESUME UX

Do not delete the route.

But make sure:
- it is not a primary navigation path
- normal authenticated users are not routed there unnecessarily

If its copy is still very developer-oriented, improve it.

Suggested:

"Open a recovery from your saved list. If support gave you a recovery ID, enter it here."

Do not prominently expose raw Case ID elsewhere.

7. CHAT SEND BUTTON ACCESSIBILITY

In RecoveryConversation:

Add an accessible name to the icon-only send button:

aria-label="Send message"

Preserve current visual appearance.

8. DOCUMENT UPLOAD KEYBOARD ACCESSIBILITY

Current upload control uses a hidden file input with a visual replacement.

Fix keyboard/focus accessibility.

Use one of:
- visually hidden input + accessible focusable label/control
or
- a real button that triggers the file input

Requirements:
- keyboard users can focus it
- Enter/Space can open file picker where appropriate
- visible focus style exists
- accessible name clearly says Upload/Replace document

Do not change upload behavior.

9. WORKSPACE NAVIGATION SEMANTICS

The active section state must not be visual-only.

Add:
aria-current="page"

to the active workspace navigation item.

Do not convert to full ARIA tab behavior unless current architecture truly behaves like tabs and it can be done safely.

Keep the implementation minimal.

10. RECOVERY STEPS SEMANTICS

Where recovery steps are a sequential process, use semantic:

<ol>
<li>

instead of repeated generic divs where practical.

Preserve current visual timeline.

11. MOBILE STATUS VISIBILITY

On mobile, do not leave only an unexplained colored dot.

Keep a compact readable status label visible where practical.

Example:
"Ready for review"

Make sure it does not destroy the header layout.

12. MOBILE WORKSPACE NAVIGATION

Review narrow-width behavior.

Keep:
- Overview
- Documents
- Recovery
- Agent

discoverable on small screens.

If horizontal scrolling remains, ensure it is usable and not accidentally clipped.

Do not overdesign.

13. GOOGLE LOGIN ERROR FEEDBACK

LandingPage currently logs login failure to console.

Add visible, calm inline error feedback near the login action.

Suggested:

"We couldn't complete Google sign-in. Please try again."

Do not expose Firebase error codes to users.

Keep console logging if useful for development.

14. LOGOUT ERROR FEEDBACK

If logout fails, show a small visible error.

Suggested:

"We couldn't sign you out. Please try again."

Do not leave the user guessing.

15. AUTH LOADING STATE

When auth is restoring/loading on LandingPage:

Do not leave the main action area visually empty.

Use a subtle disabled/loading state such as:

"Checking sign-in..."

Keep it minimal.

16. RECOVERIES ACCESSIBILITY

Each recovery row/button should have an accessible action name.

Example:

aria-label={`Open recovery: ${recovery.title}`}

Preserve visible text.

17. RECOVERIES EMPTY / ERROR / LOADING

Keep the current successful separation between:
- loading
- error
- success
- empty

Do not reintroduce the earlier race/flicker.

Improve only wording if needed.

18. NEW RECOVERY COPY

Keep:
"What happened?"

Improve supporting copy to something like:

"Paste the notice you received, or briefly describe what stopped your application."

Avoid technical instructions unless necessary.

If a recovery has been saved/created and the UI already knows that, make the saved state clearer with existing information only.

Do NOT add a new backend feature.

19. GENERAL ERROR COPY

Replace vague/system-like messages when encountered.

Examples:

"Document request failed."
→ "We couldn't update this document. Please try again."

"We couldn't load this recovery case."
→ "We couldn't load this recovery. Return to My Recoveries and try again."

Keep error messages:
- concise
- non-blaming
- actionable

20. TOUCH TARGETS

Review major interactive buttons on mobile.

Primary/important controls should generally be at least around 40px tall where practical.

Do not globally enlarge every tiny control without reason.

21. VISUAL CONSISTENCY

Fix obvious inconsistencies only.

Examples:
- signed-in landing nav should use consistent flex/alignment
- section heading hierarchy may be strengthened slightly
- consistent spacing between icon/text
- consistent active/hover/focus states

Do not redesign cards/layouts wholesale.

22. FOCUS STATES

Review:
- buttons
- upload controls
- nav controls
- form inputs
- icon-only controls

Ensure keyboard focus is visible.

Preserve current style system.

23. CLEANUP

Remove obsolete commented starter/demo CSS if clearly unused.

Do not perform broad unrelated refactors.

24. DO NOT TOUCH

Do not modify:
- Firebase auth ownership model
- backend auth verification
- Firestore schema
- case ownership
- document validation logic
- final review logic
- recovery status transitions
- Agent tools/instructions
- Gemini model
- ADK session persistence
- chat persistence architecture
- deployment configuration
- demo/presentation assets

25. VERIFICATION

Do NOT call Gemini.

Run:
- npm run build
- npm run lint
- git diff --check

If lint reports warnings:
- distinguish existing warnings from newly introduced ones
- fix new accessibility/usability warnings when practical
- do not over-refactor unrelated existing warnings

WHEN FINISHED

Do NOT commit or push.

Report:
1. files changed
2. copy/content changes
3. accessibility changes
4. navigation changes
5. mobile changes
6. visual consistency changes
7. any audit items intentionally left unchanged and why
8. build result
9. lint result
10. git diff --check result
11. confirm no Gemini requests were sent
12. exact manual QA checklist for my final review