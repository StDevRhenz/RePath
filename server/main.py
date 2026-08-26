from fastapi import FastAPI

app = FastAPI(
    title="RePath API",
    description="Backend API for the RePath autonomous recovery agent",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "service": "RePath API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}