from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin

from config import ALLOWED_ORIGINS
from auth import get_current_user
from routes.account import router as account_router
from routes.cases import router as cases_router
from routes.agent import router as agent_router
from routes.documents import router as documents_router


if not firebase_admin._apps:
    firebase_admin.initialize_app()


app = FastAPI(
    title="RePath API",
    description="Backend API for the RePath autonomous recovery agent",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases_router)
app.include_router(agent_router)
app.include_router(documents_router)
app.include_router(account_router)


@app.get("/")
def root():
    return {
        "service": "RePath API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "repath-api",
    }


@app.get("/api/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return {
        "uid": user["uid"],
        "email": user.get("email"),
    }
