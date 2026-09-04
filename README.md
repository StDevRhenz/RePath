# RePath
 It explains what went wrong, identifies the required fixes, and helps users prepare for resubmission.

## Features

- Google sign-in with Firebase Authentication
- Recovery cases with persistent progress and ownership
- AI-generated recovery steps
- Document upload, validation, and status tracking
- Readiness checks before resubmission
- Case-aware assistant through Ask RePath

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, Google ADK, Gemini
- Services: Firebase Authentication, Firestore, Google Cloud

## Prerequisites

- Node.js and npm
- Python 3.13+
- Firebase project with Google sign-in and Firestore enabled
- Gemini API access

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

Create `client/.env` using `client/.env.example`, set `VITE_API_URL` to the backend URL, then run:

```powershell
npm run dev
```

Frontend URL: `http://localhost:5173`

## Basic Flow

1. Sign in with Google.
2. Start a recovery case and provide the application feedback.
3. Review the issues and recovery steps.
4. Upload or replace the required documents.
5. Run the readiness check before resubmission.

## Verification

```powershell
cd client
npm run build
npm run lint
git diff --check
```
