from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .pipeline import run_pipeline

app = FastAPI(
    title="AI IaC Platform API",
    description="Generate Infrastructure as Code from architecture diagrams",
    version="1.0.0"
)

# CORS Configuration - Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative React dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI IaC Platform API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

@app.post("/generate")
async def generate(file: UploadFile):
    """
    Generate Terraform code from architecture diagram

    Supports:
    - PNG/JPEG images
    - draw.io XML files
    - Lucidchart JSON files

    Returns:
    - terraform_code: Generated Terraform code
    - request_id: Unique request identifier
    - resources: Detected cloud resources
    - provider: Cloud provider (aws/azure/gcp)
    """
    try:
        result = await run_pipeline(file)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating infrastructure code: {str(e)}"
        )
