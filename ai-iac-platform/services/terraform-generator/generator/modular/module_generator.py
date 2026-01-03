"""
Modular Terraform code generator
Creates proper module structure following Terraform best practices
"""
from pathlib import Path
from typing import Dict, List


def generate_module_structure(base_path: Path, resource: Dict) -> Dict:
    """
    Generate a Terraform module for a single resource type
    Returns module configuration
    """
    resource_type = resource['type']
    resource_id = resource['id']
    module_name = f"{resource_type.replace('_', '-')}-{resource_id}"

    # Create module directory
    module_path = base_path / "modules" / module_name
    module_path.mkdir(parents=True, exist_ok=True)

    # Generate module files
    generate_module_main(module_path, resource)
    generate_module_variables(module_path, resource)
    generate_module_outputs(module_path, resource)

    return {
        "name": module_name,
        "source": f"./modules/{module_name}",
        "resource_type": resource_type,
        "resource_id": resource_id
    }


def generate_module_main(module_path: Path, resource: Dict):
    """
    Generate main.tf for the module
    """
    resource_type = resource['type']
    provider = resource_type.split('_')[0]  # aws, azure, gcp

    if provider == 'aws':
        content = generate_aws_module_main(resource)
    elif provider == 'azure':
        content = generate_azure_module_main(resource)
    elif provider == 'gcp':
        content = generate_gcp_module_main(resource)
    else:
        content = f"# Unsupported resource type: {resource_type}\n"

    (module_path / "main.tf").write_text(content)


def generate_aws_module_main(resource: Dict) -> str:
    """Generate AWS resource module main.tf"""
    resource_type = resource['type']

    if resource_type == 'aws_vpc':
        return '''module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = var.vpc_name
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = var.enable_nat_gateway
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.common_tags,
    {
      Name = var.vpc_name
      Type = "VPC"
    }
  )
}
'''
    elif resource_type == 'aws_eks':
        return '''module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  cluster_endpoint_public_access = var.enable_public_access

  eks_managed_node_groups = {
    default = {
      min_size     = var.node_group_min_size
      max_size     = var.node_group_max_size
      desired_size = var.node_group_desired_size

      instance_types = var.instance_types
      capacity_type  = var.capacity_type
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name = var.cluster_name
      Type = "EKS"
    }
  )
}
'''
    elif resource_type == 'aws_alb':
        return '''module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name               = var.alb_name
  load_balancer_type = "application"

  vpc_id  = var.vpc_id
  subnets = var.subnet_ids

  security_group_ingress_rules = {
    http = {
      from_port   = 80
      to_port     = 80
      ip_protocol = "tcp"
      cidr_ipv4   = "0.0.0.0/0"
    }
    https = {
      from_port   = 443
      to_port     = 443
      ip_protocol = "tcp"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name = var.alb_name
      Type = "ALB"
    }
  )
}
'''
    else:
        return f"# AWS resource type {resource_type} not yet implemented\n"


def generate_azure_module_main(resource: Dict) -> str:
    """Generate Azure resource module main.tf"""
    resource_type = resource['type']

    if resource_type == 'azure_vnet':
        return '''resource "azurerm_virtual_network" "main" {
  name                = var.vnet_name
  address_space       = var.address_space
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = var.common_tags
}

resource "azurerm_subnet" "subnets" {
  for_each = var.subnets

  name                 = each.key
  resource_group_name  = var.resource_group_name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = each.value
}
'''
    else:
        return f"# Azure resource type {resource_type} not yet implemented\n"


def generate_gcp_module_main(resource: Dict) -> str:
    """Generate GCP resource module main.tf"""
    resource_type = resource['type']

    if resource_type == 'gcp_gke':
        return '''resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.location

  initial_node_count       = var.initial_node_count
  remove_default_node_pool = true

  network    = var.network
  subnetwork = var.subnetwork

  node_config {
    machine_type = var.machine_type
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
'''
    else:
        return f"# GCP resource type {resource_type} not yet implemented\n"


def generate_module_variables(module_path: Path, resource: Dict):
    """
    Generate variables.tf for the module
    """
    resource_type = resource['type']
    provider = resource_type.split('_')[0]

    if provider == 'aws':
        content = generate_aws_module_variables(resource)
    elif provider == 'azure':
        content = generate_azure_module_variables(resource)
    elif provider == 'gcp':
        content = generate_gcp_module_variables(resource)
    else:
        content = "# No variables defined\n"

    (module_path / "variables.tf").write_text(content)


def generate_aws_module_variables(resource: Dict) -> str:
    """Generate AWS module variables"""
    resource_type = resource['type']

    if resource_type == 'aws_vpc':
        return '''variable "vpc_name" {
  description = "Name of the VPC"
  type        = string
  default     = "main-vpc"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
'''
    elif resource_type == 'aws_eks':
        return '''variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "main-eks-cluster"
}

variable "cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "vpc_id" {
  description = "VPC ID for EKS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for EKS cluster"
  type        = list(string)
}

variable "enable_public_access" {
  description = "Enable public API access"
  type        = bool
  default     = true
}

variable "node_group_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 1
}

variable "node_group_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 3
}

variable "node_group_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

variable "instance_types" {
  description = "Instance types for node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "capacity_type" {
  description = "Capacity type (ON_DEMAND or SPOT)"
  type        = string
  default     = "ON_DEMAND"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
'''
    elif resource_type == 'aws_alb':
        return '''variable "alb_name" {
  description = "Name of the Application Load Balancer"
  type        = string
  default     = "main-alb"
}

variable "vpc_id" {
  description = "VPC ID for ALB"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for ALB"
  type        = list(string)
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
'''
    else:
        return "# Variables not defined\n"


def generate_azure_module_variables(resource: Dict) -> str:
    """Generate Azure module variables"""
    return '''variable "vnet_name" {
  description = "Name of the virtual network"
  type        = string
}

variable "address_space" {
  description = "Address space for VNet"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
}

variable "subnets" {
  description = "Map of subnet names to address prefixes"
  type        = map(list(string))
  default     = {}
}

variable "common_tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
'''


def generate_gcp_module_variables(resource: Dict) -> str:
    """Generate GCP module variables"""
    return '''variable "cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
}

variable "location" {
  description = "GCP region or zone"
  type        = string
  default     = "us-central1"
}

variable "initial_node_count" {
  description = "Initial node count"
  type        = number
  default     = 1
}

variable "machine_type" {
  description = "Machine type for nodes"
  type        = string
  default     = "e2-medium"
}

variable "network" {
  description = "Network name"
  type        = string
}

variable "subnetwork" {
  description = "Subnetwork name"
  type        = string
}
'''


def generate_module_outputs(module_path: Path, resource: Dict):
    """
    Generate outputs.tf for the module
    """
    resource_type = resource['type']

    if resource_type == 'aws_vpc':
        content = '''output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}
'''
    elif resource_type == 'aws_eks':
        content = '''output "cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID"
  value       = module.eks.cluster_security_group_id
}
'''
    elif resource_type == 'aws_alb':
        content = '''output "alb_arn" {
  description = "ALB ARN"
  value       = module.alb.arn
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.dns_name
}
'''
    else:
        content = "# No outputs defined\n"

    (module_path / "outputs.tf").write_text(content)
