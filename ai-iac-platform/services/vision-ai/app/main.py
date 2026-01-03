from fastapi import FastAPI, UploadFile, HTTPException
from .detector import detect_icons
from .graph_builder import build_graph
from .normalizer import normalize_graph
from .format_detector import validate_file, DiagramFormat
from .parsers import parse_drawio, parse_lucidchart

app = FastAPI(title="Vision AI Service")

@app.post("/analyze")
async def analyze_diagram(file: UploadFile):
    """
    Analyze architecture diagram from multiple formats:
    - PNG/JPEG images (AI vision analysis)
    - draw.io XML files
    - Lucidchart JSON files
    """
    file_bytes = await file.read()
    filename = file.filename or "diagram"

    # Validate and detect file format
    is_valid, error_msg, file_format = validate_file(file_bytes, filename)

    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Route to appropriate parser based on format
    detections = []

    if file_format in [DiagramFormat.PNG, DiagramFormat.JPEG, DiagramFormat.JPG]:
        # Use AI vision detection for images
        detections = detect_icons(file_bytes)
    elif file_format == DiagramFormat.DRAWIO:
        # Parse draw.io XML
        detections = parse_drawio(file_bytes)
    elif file_format == DiagramFormat.LUCIDCHART:
        # Parse Lucidchart JSON
        detections = parse_lucidchart(file_bytes)

    if not detections:
        raise HTTPException(
            status_code=400,
            detail="No cloud resources detected in the diagram"
        )

    # Build graph and normalize
    graph = build_graph(detections)
    return normalize_graph(graph)
