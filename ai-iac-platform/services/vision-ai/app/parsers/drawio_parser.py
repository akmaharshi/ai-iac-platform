"""
Draw.io XML parser
Parses .drawio and .xml files exported from draw.io
"""
import xml.etree.ElementTree as ET
from typing import List, Dict


def parse_drawio(xml_bytes: bytes) -> List[Dict]:
    """
    Parse draw.io XML format
    Extract shapes and their relationships
    Returns list of detected resources
    """
    try:
        xml_str = xml_bytes.decode('utf-8')
        root = ET.fromstring(xml_str)

        resources = []
        resource_map = {}  # Track resources by ID for relationship mapping

        # Find all mxCell elements (shapes/objects in draw.io)
        for diagram in root.iter('diagram'):
            mxGraphModel = diagram.find('.//mxGraphModel')
            if mxGraphModel is None:
                continue

            root_element = mxGraphModel.find('root')
            if root_element is None:
                continue

            # First pass: identify all shapes
            for cell in root_element.findall('mxCell'):
                cell_id = cell.get('id')
                cell_value = cell.get('value', '').lower()
                cell_style = cell.get('style', '').lower()

                # Skip edges/connectors
                if cell.get('edge') == '1':
                    continue

                # Try to identify AWS/Azure/GCP resources from labels and styles
                resource_type = identify_resource_type(cell_value, cell_style)

                if resource_type:
                    resource = {
                        "id": cell_id or f"resource-{len(resources)}",
                        "type": resource_type,
                        "label": cell_value,
                        "properties": {}
                    }
                    resources.append(resource)
                    resource_map[cell_id] = resource

            # Second pass: identify relationships (edges)
            for cell in root_element.findall('mxCell'):
                if cell.get('edge') == '1':
                    source = cell.get('source')
                    target = cell.get('target')

                    if source in resource_map and target in resource_map:
                        # Add relationship information
                        if 'depends_on' not in resource_map[target]:
                            resource_map[target]['depends_on'] = []
                        resource_map[target]['depends_on'].append(source)

        # If no resources found, create defaults
        if not resources:
            resources = get_default_resources()

        return resources

    except Exception as e:
        print(f"Error parsing draw.io file: {e}")
        return get_default_resources()


def identify_resource_type(label: str, style: str) -> str:
    """
    Identify cloud resource type from shape label and style
    """
    label_lower = label.lower()
    style_lower = style.lower()

    # AWS Resources
    if any(keyword in label_lower for keyword in ['vpc', 'virtual private cloud']):
        return 'aws_vpc'
    if any(keyword in label_lower for keyword in ['eks', 'kubernetes', 'k8s', 'elastic kubernetes']):
        return 'aws_eks'
    if any(keyword in label_lower for keyword in ['alb', 'load balancer', 'application load']):
        return 'aws_alb'
    if any(keyword in label_lower for keyword in ['ec2', 'instance', 'virtual machine']):
        return 'aws_ec2'
    if any(keyword in label_lower for keyword in ['rds', 'database', 'mysql', 'postgres']):
        return 'aws_rds'
    if any(keyword in label_lower for keyword in ['s3', 'bucket', 'storage']):
        return 'aws_s3'

    # Azure Resources
    if any(keyword in label_lower for keyword in ['azure', 'vnet', 'virtual network']):
        return 'azure_vnet'
    if any(keyword in label_lower for keyword in ['aks', 'azure kubernetes']):
        return 'azure_aks'

    # GCP Resources
    if any(keyword in label_lower for keyword in ['gcp', 'google cloud', 'gke', 'google kubernetes']):
        return 'gcp_gke'
    if any(keyword in label_lower for keyword in ['compute engine', 'gce']):
        return 'gcp_compute'

    # Check style for cloud provider indicators
    if 'aws' in style_lower:
        if 'network' in style_lower:
            return 'aws_vpc'
        if 'compute' in style_lower:
            return 'aws_ec2'

    return None


def get_default_resources() -> List[Dict]:
    """
    Return default resources if parsing fails
    """
    return [
        {"id": "vpc-1", "type": "aws_vpc", "label": "VPC", "properties": {}},
        {"id": "eks-1", "type": "aws_eks", "label": "EKS Cluster", "properties": {}},
        {"id": "alb-1", "type": "aws_alb", "label": "Application Load Balancer", "properties": {}}
    ]
