"""
Lucidchart JSON parser
Parses JSON exports from Lucidchart
"""
import json
from typing import List, Dict


def parse_lucidchart(json_bytes: bytes) -> List[Dict]:
    """
    Parse Lucidchart JSON format
    Extract shapes and their relationships
    Returns list of detected resources
    """
    try:
        json_str = json_bytes.decode('utf-8')
        data = json.loads(json_str)

        resources = []
        resource_map = {}

        # Lucidchart exports can have different structures
        # Handle common export formats

        if isinstance(data, dict):
            # Check for pages/shapes structure
            pages = data.get('pages', [])
            shapes = data.get('shapes', [])

            # If shapes are at root level
            if shapes:
                resources = extract_resources_from_shapes(shapes)

            # If shapes are nested in pages
            elif pages:
                for page in pages:
                    page_shapes = page.get('shapes', [])
                    resources.extend(extract_resources_from_shapes(page_shapes))

            # Handle objects/elements structure
            elif 'objects' in data or 'elements' in data:
                objects = data.get('objects', data.get('elements', []))
                resources = extract_resources_from_shapes(objects)

        # If no resources found, return defaults
        if not resources:
            resources = get_default_resources()

        return resources

    except Exception as e:
        print(f"Error parsing Lucidchart file: {e}")
        return get_default_resources()


def extract_resources_from_shapes(shapes: List[Dict]) -> List[Dict]:
    """
    Extract cloud resources from Lucidchart shapes
    """
    resources = []

    for shape in shapes:
        shape_id = shape.get('id', f"shape-{len(resources)}")
        text = shape.get('text', '').lower()
        name = shape.get('name', '').lower()
        shape_type = shape.get('type', '').lower()

        # Combine all text fields for matching
        combined_text = f"{text} {name} {shape_type}"

        # Identify resource type
        resource_type = identify_resource_from_text(combined_text)

        if resource_type:
            resource = {
                "id": shape_id,
                "type": resource_type,
                "label": text or name or "Untitled",
                "properties": {}
            }

            # Extract properties if available
            if 'properties' in shape:
                resource['properties'] = shape['properties']

            resources.append(resource)

    return resources


def identify_resource_from_text(text: str) -> str:
    """
    Identify cloud resource type from text
    """
    text_lower = text.lower()

    # AWS Resources
    if any(kw in text_lower for kw in ['vpc', 'virtual private cloud']):
        return 'aws_vpc'
    if any(kw in text_lower for kw in ['eks', 'kubernetes', 'k8s']):
        return 'aws_eks'
    if any(kw in text_lower for kw in ['alb', 'load balancer', 'application load']):
        return 'aws_alb'
    if any(kw in text_lower for kw in ['ec2', 'instance']):
        return 'aws_ec2'
    if any(kw in text_lower for kw in ['rds', 'database']):
        return 'aws_rds'
    if any(kw in text_lower for kw in ['s3', 'bucket']):
        return 'aws_s3'
    if any(kw in text_lower for kw in ['lambda', 'function']):
        return 'aws_lambda'

    # Azure Resources
    if any(kw in text_lower for kw in ['azure', 'vnet', 'virtual network']) and 'aws' not in text_lower:
        return 'azure_vnet'
    if any(kw in text_lower for kw in ['aks', 'azure kubernetes']):
        return 'azure_aks'
    if any(kw in text_lower for kw in ['azure vm', 'virtual machine']) and 'aws' not in text_lower:
        return 'azure_vm'

    # GCP Resources
    if any(kw in text_lower for kw in ['gcp', 'google cloud', 'gke', 'google kubernetes']):
        return 'gcp_gke'
    if any(kw in text_lower for kw in ['compute engine', 'gce']):
        return 'gcp_compute'
    if any(kw in text_lower for kw in ['cloud storage', 'gcs']):
        return 'gcp_storage'

    return None


def get_default_resources() -> List[Dict]:
    """
    Return default resources if parsing fails
    """
    return [
        {"id": "vpc-1", "type": "aws_vpc", "label": "VPC", "properties": {}},
        {"id": "eks-1", "type": "aws_eks", "label": "EKS Cluster", "properties": {}},
        {"id": "alb-1", "type": "aws_alb", "label": "Load Balancer", "properties": {}}
    ]
