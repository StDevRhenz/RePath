# RePath

> **An autonomous AI agent for recovering failed and incomplete application workflows.**

RePath is an AI-powered recovery agent designed to help users understand, diagnose, and recover failed document-heavy application processes.

Instead of simply explaining why an application failed, RePath analyzes the case, identifies missing or inconsistent requirements, creates a recovery plan, tracks progress, and resumes the workflow when the user provides the required information.

Built for the **All Things Agentic Hackathon** under **The Taskmaster** track.

---

## The Problem

Document-heavy processes such as scholarship applications, admissions, permits, onboarding, and claims often involve multiple requirements and steps.

When an application is rejected or returned, users may need to manually:

1. Understand the rejection reason.
2. Review all requirements.
3. Compare requirements with submitted documents.
4. Identify missing, outdated, or inconsistent information.
5. Determine how each issue should be resolved.
6. Track unresolved requirements.
7. Recheck the entire application before resubmission.

RePath turns this recovery process into an agent-driven workflow.

---

## How RePath Works

```text
Rejected / Incomplete Application
              ↓
      Analyze Rejection
              ↓
     Extract Requirements
              ↓
      Validate Documents
              ↓
       Diagnose Issues
              ↓
    Create Recovery Plan
              ↓
     Execute Safe Actions
              ↓
    Human Input Required?
         ↙         ↘
       Yes          No
        ↓            ↓
   Wait for User   Continue
        ↓
   Resume Workflow
        ↓
    Revalidate Case
        ↓
 Ready for Resubmission
```

---

## MVP Use Case

The initial RePath prototype focuses on recovering a **rejected scholarship application**.

The agent can identify issues such as:

* Missing documents
* Outdated documents
* Incomplete requirements
* Information inconsistencies
* Unresolved recovery steps

The architecture is designed so additional document-heavy workflows can be supported in the future.

---

## Agent Capabilities

RePath is designed around several agent tools:

* `analyze_rejection()` — identifies why an application was rejected or returned.
* `extract_requirements()` — converts application requirements into structured data.
* `validate_documents()` — checks submitted documents against requirements.
* `create_recovery_plan()` — generates actionable steps for resolving detected issues.
* `update_case()` — maintains the persistent state of the recovery workflow.
* `verify_case()` — performs final validation before marking a case ready for resubmission.

---

## Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI

### AI & Agent

* Gemini 3.5+
* Google Agent Development Kit (ADK)

### Google Cloud

* Cloud Run
* Firestore
* Cloud Storage

### Development

* Git
* GitHub

---

## Architecture

```text
                    User
                      │
                      ▼
              React Web Client
                      │
                    HTTPS
                      │
                      ▼
              FastAPI Backend
                Google Cloud Run
                      │
                      ▼
                Google ADK
                 RePath Agent
                      │
                      ▼
                 Gemini 3.5+
                      │
             ┌────────┴────────┐
             │                 │
        Agent Tools        Case State
             │                 │
             ▼                 ▼
       Cloud Storage       Firestore
```

A detailed architecture diagram will be added as development progresses.

---

## Project Structure

```text
RePath/
├── client/
│   └── React + TypeScript frontend
│
├── server/
│   └── FastAPI + RePath agent backend
│
├── README.md
└── .gitignore
```

---

## Getting Started

> Full spin-up instructions will be added as the project reaches the deployment stage.

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

Create and activate a Python virtual environment.

```bash
cd server
python -m venv .venv
```

Install the required dependencies and start the API.

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available locally at:

```text
http://127.0.0.1:8000
```

---

## Environment Variables

Secrets and API credentials must **not** be committed to the repository.

Use the example files as non-secret configuration references:

* `client/.env.example`
* `server/.env.example`

Local frontend:

```bash
cd client
npm run dev
```

Production frontend:

```bash
cd client
npm run build
```

Local backend:

```bash
cd server
uvicorn main:app --reload
```

Production backend:

```bash
cd server
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Important non-secret configuration:

```text
VITE_API_URL=http://127.0.0.1:8000
GOOGLE_CLOUD_PROJECT=repath-506704
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_DOCUMENT_UPLOAD_SIZE_BYTES=10485760
UPLOAD_DIR=uploads
ADK_SESSION_DB_URL=sqlite+aiosqlite:///./data/adk_sessions.db
```

Runtime uploads and the local ADK SQLite session database currently live on local disk under `server/uploads/` and `server/data/`. Cloud deployment may need persistent disk or cloud storage later so uploaded documents and ADK session state survive host restarts.

---

## Current Development Status

* [x] Project concept and scope
* [x] Frontend initialization
* [x] FastAPI backend initialization
* [ ] Google ADK integration
* [ ] Gemini integration
* [ ] RePath agent tools
* [ ] Firestore case persistence
* [ ] Cloud Storage integration
* [ ] Frontend recovery workflow
* [ ] Google Cloud deployment
* [ ] Architecture diagram
* [ ] Demo and testing

---

## Hackathon

RePath is being developed as a solo project for the **All Things Agentic Hackathon**.

**Track:** The Taskmaster

The project focuses on demonstrating an autonomous workflow that can diagnose a failed process, determine the necessary recovery actions, maintain state, request human intervention only when required, and resume execution until the case is ready for resubmission.

---

## Author

**Rhenz Ganotice**

---

## License

No license has been specified at this stage.
