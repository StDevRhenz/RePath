# RePath
 It explains what went wrong, identifies the required fixes, and helps users prepare for resubmission.

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

## Verification

```powershell
cd client
npm run build
npm run lint
git diff --check
```
