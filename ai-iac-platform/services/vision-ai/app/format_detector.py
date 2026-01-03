"""
File format detection and validation
"""
import io
import magic
from enum import Enum
from typing import Tuple


class DiagramFormat(Enum):
    PNG = "image/png"
    JPEG = "image/jpeg"
    JPG = "image/jpeg"
    DRAWIO = "application/xml"
    LUCIDCHART = "application/json"
    UNKNOWN = "unknown"


def detect_format(file_bytes: bytes, filename: str) -> DiagramFormat:
    """
    Detect file format from bytes and filename
    Returns DiagramFormat enum
    """
    # Check file extension first
    filename_lower = filename.lower()

    if filename_lower.endswith('.drawio') or filename_lower.endswith('.xml'):
        # Check if it's a draw.io file by looking for draw.io markers
        try:
            content = file_bytes.decode('utf-8')
            if 'mxGraphModel' in content or 'mxfile' in content:
                return DiagramFormat.DRAWIO
        except:
            pass

    if filename_lower.endswith('.json'):
        # Check if it's a Lucidchart export
        try:
            import json
            data = json.loads(file_bytes.decode('utf-8'))
            if 'lucidchart' in str(data).lower() or 'shapes' in data or 'lines' in data:
                return DiagramFormat.LUCIDCHART
        except:
            pass

    # Fallback to MIME type detection for images
    if filename_lower.endswith(('.png', '.jpg', '.jpeg')):
        if filename_lower.endswith('.png'):
            return DiagramFormat.PNG
        else:
            return DiagramFormat.JPEG

    # Try magic bytes detection
    try:
        mime_type = magic.from_buffer(file_bytes, mime=True)
        if mime_type == 'image/png':
            return DiagramFormat.PNG
        elif mime_type in ['image/jpeg', 'image/jpg']:
            return DiagramFormat.JPEG
        elif mime_type in ['application/xml', 'text/xml']:
            return DiagramFormat.DRAWIO
        elif mime_type == 'application/json':
            return DiagramFormat.LUCIDCHART
    except:
        pass

    return DiagramFormat.UNKNOWN


def validate_file(file_bytes: bytes, filename: str) -> Tuple[bool, str, DiagramFormat]:
    """
    Validate uploaded file
    Returns (is_valid, error_message, format)
    """
    # Check file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    if len(file_bytes) > max_size:
        return False, "File size exceeds 10MB limit", DiagramFormat.UNKNOWN

    # Detect format
    file_format = detect_format(file_bytes, filename)

    if file_format == DiagramFormat.UNKNOWN:
        return False, "Unsupported file format. Please upload PNG, JPEG, draw.io, or Lucidchart files", file_format

    return True, "", file_format
