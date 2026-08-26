from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.cases import router as cases_router


app = FastAPI(
    title="RePath API",
    description="Backend API for the RePath autonomous recovery agent",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases_router)


@app.get("/")
def root():
    return {
        "service": "RePath API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}