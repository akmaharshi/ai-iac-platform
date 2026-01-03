import httpx

from generator.dispatcher import generate_terraform

VISION_AI_URL = "http://vision-ai:8000/analyze"


async def run_pipeline(file):
    """
    Main pipeline for IaC generation
    1. Analyze diagram (supports PNG, JPEG, draw.io, Lucidchart)
    2. Generate modular Terraform code
    3. Return results with code preview
    """
    filename = file.filename or "diagram"
    file_content = await file.read()

    # Step 1: Analyze diagram
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            VISION_AI_URL,
            files={"file": (filename, file_content, file.content_type or "application/octet-stream")},
        )

    if response.status_code != 200:
        error_detail = response.json().get("detail", "Vision AI failed")
        raise RuntimeError(f"Vision AI failed: {error_detail}")

    vision_result = response.json()
    architecture = vision_result.get("architecture", vision_result)

    # Step 2: Generate Terraform code
    terraform_result = generate_terraform(architecture)

    # Return comprehensive result
    return {
        "request_id": terraform_result["request_id"],
        "terraform_path": terraform_result["terraform_path"],
        "terraform_code": terraform_result.get("terraform_code", ""),
        "status": "terraform_generated",
        "provider": terraform_result.get("provider", "aws"),
        "resources": terraform_result.get("resources", []),
    }
