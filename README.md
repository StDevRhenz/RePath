# RePath

RePath helps users understand why an application was rejected or delayed, what to fix, and what to do next.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, Google ADK, Gemini
- Services: Firebase Authentication, Firestore, Google Cloud

## Prerequisites

- Node.js and npm
- Python 3.13+
- Firebase project with Google sign-in and Firestore enabled
- Gemini API access for the real backend flow

## Local Setup

### Backend

```powershell
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `server/.env` using `server/.env.example`, then run:

```powershell
uvicorn main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

### Frontend

In another terminal:

```powershell
cd client
npm install
```

Create `client/.env` using `client/.env.example`, then run:

```powershell
npm run dev
```

Frontend URL: `http://localhost:5173`

## Basic Flow

1. Sign in with Google.
2. Open an existing recovery or start a new one.
3. Review the application issues and recovery steps.
4. Upload or replace the required documents.
5. Run the RePath readiness check before resubmission.

## Demo Screenshots

### Landing Page

The landing page introduces RePath and provides the Google sign-in entry point.

![RePath landing page](docs/images/landing-page.png)

### Recoveries Page

The recoveries page is the home screen where users continue an existing application or start a new recovery.

![RePath recoveries page](docs/images/recoveries-empty.png)

### New Recovery Form

The new recovery form lets users describe what happened to their application.

![New recovery form](docs/images/new-recovery-empty.png)

### Filled Demo Input

The filled demo input shows the realistic returned-business-registration case used by the portfolio flow.

![Filled RePath demo input](docs/images/new-recovery-filled.png)

### Alternate Filled Demo Input

This alternate screenshot shows the same business-registration notice ready for local demo analysis.

![Alternate filled demo input](docs/images/new-recovery-filled-alt.png)

### Analysis Result

The analysis screen explains the three detected issues and lists the next actions in order.

![RePath analysis result](docs/images/analysis-result.png)

### Populated Recoveries Page

The populated recoveries page shows the RG Brew Corner case with its current action-required status.

![Populated recoveries page](docs/images/recoveries-populated.png)

### Case Overview

The case overview summarizes progress, outstanding issues, and the next document action.

![Case overview](docs/images/case-overview.png)

### Documents Workspace

The documents workspace lists each file, its current status, and the available replacement actions.

![Documents workspace](docs/images/case-documents.png)

### Recovery Plan

The recovery plan presents the ordered steps from fixing the address through the final readiness review.

![Recovery plan](docs/images/recovery-plan.png)

### Ask RePath Panel

The Ask RePath panel provides case-specific guidance without claiming agency approval or acceptance.

![Ask RePath panel](docs/images/ask-repath-panel.png)

### Account Menu

The account menu gives the signed-in user access to account actions and sign-out.

![Account menu](docs/images/account-menu.png)

### Delete Account Dialog

The delete account dialog asks the user to confirm the destructive account action.

![Delete account dialog](docs/images/delete-account-dialog.png)

### Sign-Out Dialog

The sign-out dialog confirms whether the user wants to leave the current RePath session.

![Sign-out dialog](docs/images/sign-out-dialog.png)

### Alternate Landing Page

This alternate landing screenshot shows the same clean RePath entry experience with the Google sign-in action.

![Alternate landing page](docs/images/landing-page-alt.png)

### Alternate Recoveries Page

This alternate recoveries screenshot shows the empty state before a user has created or loaded a recovery.

![Alternate empty recoveries page](docs/images/recoveries-empty-alt.png)


## Disclaimer
RePath only analyzes the information and documents provided by the user and indicates readiness for resubmission; it does not approve, verify, accept, or submit applications to government agencies.
