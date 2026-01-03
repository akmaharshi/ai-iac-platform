/**
 * Build Terraform folder structure from API response
 */

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export function buildTerraformFileTree(data: any): FileNode {
  const { terraform_code, resources = [] } = data;

  // Root terraform folder
  const root: FileNode = {
    name: 'terraform',
    type: 'folder',
    children: [
      {
        name: 'main.tf',
        type: 'file',
        content: terraform_code || '# No code generated',
      },
      {
        name: 'variables.tf',
        type: 'file',
        content: generateVariablesFile(),
      },
      {
        name: 'outputs.tf',
        type: 'file',
        content: generateOutputsFile(resources),
      },
      {
        name: 'providers.tf',
        type: 'file',
        content: generateProvidersFile(data.provider || 'aws'),
      },
      {
        name: 'versions.tf',
        type: 'file',
        content: generateVersionsFile(),
      },
    ],
  };

  // Add modules folder if there are resources
  if (resources.length > 0) {
    const modulesFolder: FileNode = {
      name: 'modules',
      type: 'folder',
      children: resources.map((resource: any) => createModuleFolder(resource)),
    };
    root.children!.push(modulesFolder);
  }

  return root;
}

function createModuleFolder(resource: any): FileNode {
  const moduleName = `${resource.type}-${resource.id}`.replace(/_/g, '-');

  return {
    name: moduleName,
    type: 'folder',
    children: [
      {
        name: 'main.tf',
        type: 'file',
        content: `# Module for ${resource.type}\n# Resource ID: ${resource.id}\n\n# Configuration will be here`,
      },
      {
        name: 'variables.tf',
        type: 'file',
        content: generateModuleVariables(resource),
      },
      {
        name: 'outputs.tf',
        type: 'file',
        content: generateModuleOutputs(resource),
      },
    ],
  };
}

function generateVariablesFile(): string {
  return `variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "Cloud provider region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "ai-iac-platform"
}
`;
}

function generateOutputsFile(resources: any[]): string {
  if (!resources || resources.length === 0) {
    return '# No outputs defined\n';
  }

  let outputs = '# Outputs from all modules\n\n';
  resources.forEach((resource) => {
    const moduleName = `${resource.type}-${resource.id}`.replace(/_/g, '-');
    outputs += `# ${moduleName}\n`;
  });

  return outputs;
}

function generateProvidersFile(provider: string): string {
  if (provider === 'aws') {
    return `provider "aws" {
  region = var.region
}
`;
  } else if (provider === 'azure') {
    return `provider "azurerm" {
  features {}
}
`;
  } else if (provider === 'gcp') {
    return `provider "google" {
  project = var.project_name
  region  = var.region
}
`;
  }
  return '# Provider configuration\n';
}

function generateVersionsFile(): string {
  return `terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
`;
}

function generateModuleVariables(resource: any): string {
  return `variable "common_tags" {
  description = "Common tags for ${resource.type}"
  type        = map(string)
  default     = {}
}
`;
}

function generateModuleOutputs(resource: any): string {
  return `# Outputs for ${resource.type}
# Add specific outputs based on resource type
`;
}

/**
 * Download all files as a ZIP
 */
export function downloadAsZip(fileTree: FileNode) {
  // In a real implementation, we'd use a library like JSZip
  // For now, we'll download main.tf as an example
  const mainFile = fileTree.children?.find(f => f.name === 'main.tf');
  if (mainFile && mainFile.content) {
    downloadFile(mainFile.content, 'main.tf', 'text/plain');
  }
}

/**
 * Download individual file
 */
export function downloadFile(content: string, fileName: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download entire folder structure as multiple files
 */
export function downloadAllFiles(fileTree: FileNode) {
  const downloadNode = (node: FileNode, path: string = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;

    if (node.type === 'file' && node.content) {
      downloadFile(node.content, currentPath.replace('terraform/', ''), 'text/plain');
    }

    if (node.type === 'folder' && node.children) {
      node.children.forEach(child => downloadNode(child, currentPath));
    }
  };

  // Small delay between downloads to avoid browser blocking
  const downloadWithDelay = async (node: FileNode) => {
    if (node.type === 'folder' && node.children) {
      for (const child of node.children) {
        if (child.type === 'file' && child.content) {
          downloadFile(child.content, child.name, 'text/plain');
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (child.type === 'folder') {
          await downloadWithDelay(child);
        }
      }
    }
  };

  downloadWithDelay(fileTree);
}
