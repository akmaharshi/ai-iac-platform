def aws_provider(region: str = "ap-south-1") -> str:
    return f"""
provider "aws" {{
  region = "{region}"
}}
""".strip()


def azure_provider(region: str = "eastus") -> str:
    return f"""
terraform {{
  required_providers {{
    azurerm = {{
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }}
  }}
}}

provider "azurerm" {{
  features {{}}
  skip_provider_registration = false
}}
""".strip()


def gcp_provider(region: str = "us-central1", project: str = "my-project") -> str:
    return f"""
terraform {{
  required_providers {{
    google = {{
      source  = "hashicorp/google"
      version = "~> 5.0"
    }}
  }}
}}

provider "google" {{
  project = var.project_id
  region  = "{region}"
}}
""".strip()


def get_provider_config(provider: str, region: str = None) -> str:
    """
    Get provider configuration based on cloud provider
    """
    if provider == 'aws':
        return aws_provider(region or "ap-south-1")
    elif provider == 'azure':
        return azure_provider(region or "eastus")
    elif provider == 'gcp':
        return gcp_provider(region or "us-central1")
    else:
        # Default to AWS
        return aws_provider(region or "ap-south-1")
