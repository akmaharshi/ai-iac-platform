# 🚀 AI IaC Platform - Infrastructure as Code Generator

**Transform architecture diagrams into production-ready Terraform code using AI**

[![Terraform](https://img.shields.io/badge/Terraform-1.6+-purple)](https://www.terraform.io/)
[![Python](https://img.shields.io/badge/Python-3.11-green)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-teal)](https://fastapi.tiangolo.com/)

---

## ✨ Features

### 📁 Multi-Format Diagram Support
- **PNG/JPEG Images** - AI-powered vision analysis
- **draw.io** (.drawio, .xml) - Direct XML parsing
- **Lucidchart** (.json) - JSON format support

### ☁️ Multi-Cloud Infrastructure
- ✅ **AWS** - VPC, EKS, ALB, EC2, RDS, S3, Lambda
- ✅ **Azure** - VNet, AKS, VM
- ✅ **GCP** - GKE, Compute Engine, Cloud Storage

### 🏗️ Production-Ready Terraform
- **Modular Structure** - Separate modules for each resource
- **Best Practices** - Variables, outputs, proper dependencies
- **Community Modules** - Uses official Terraform modules
- **Auto-Dependencies** - Intelligent resource dependency management

---

## 📋 Prerequisites

- **Docker** (>= 20.10) and **Docker Compose** (>= 2.0)
- **Node.js** (>= 18.0)
- **npm** or **yarn**
- **make** (optional, for convenience commands)

---

## 🎯 Quick Start

### Option 1: Using Makefile (Recommended)

```bash
# From repository root
cd ai-iac-platform

# Start backend services
make backend-up

# Install frontend dependencies
make ui-install

# Start frontend (in new terminal)
make ui-dev
```

### Option 2: Manual Setup

```bash
# Start backend
cd ai-iac-platform/infra
docker-compose up --build -d

# Start frontend (in new terminal)
cd ai-iac-platform/apps/idp-ui
npm install
npm run dev
```

### 🌐 Access the Application

- **Frontend UI**: http://localhost:5173
- **API Gateway**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Vision AI**: http://localhost:8001

---

## 📖 How to Use

### 1️⃣ Upload Architecture Diagram

Upload your infrastructure diagram in any supported format:
- PNG or JPEG images
- draw.io files (.drawio or .xml)
- Lucidchart exports (.json)

### 2️⃣ Select Cloud Provider

Choose your target cloud platform:
- AWS (Amazon Web Services)
- Azure (Microsoft Azure)
- GCP (Google Cloud Platform)

### 3️⃣ Generate Infrastructure Code

The platform will:
1. ⚙️ **Analyze** your diagram using AI
2. 🏗️ **Generate** modular Terraform code
3. 🔒 **Scan** for security issues (coming soon)
4. 💰 **Estimate** infrastructure costs (coming soon)

### 4️⃣ Download & Deploy

Download the generated Terraform code with this structure:

```
terraform/
├── main.tf          # Module calls
├── variables.tf     # Input variables
├── outputs.tf       # Output values
├── providers.tf     # Cloud provider config
├── versions.tf      # Terraform versions
└── modules/
    ├── aws-vpc-vpc-1/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── aws-eks-eks-1/
    └── aws-alb-alb-1/
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend UI   │
│  (React + Vite) │
│  Port: 5173     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  API Gateway    │
│   (FastAPI)     │
│  Port: 8000     │
└────────┬────────┘
         │
         ├──────────────────┬────────────────────┐
         ↓                  ↓                    ↓
┌────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│   Vision AI    │ │    Terraform    │ │   Security       │
│   Service      │ │    Generator    │ │   Scanner        │
│  Port: 8001    │ │                 │ │                  │
└────────────────┘ └─────────────────┘ └──────────────────┘
```

---

## 🔌 API Endpoints

### Generate Infrastructure

```bash
POST /generate
Content-Type: multipart/form-data

# Example
curl -X POST http://localhost:8000/generate \
  -F "file=@architecture.png"
```

**Response:**
```json
{
  "request_id": "uuid",
  "terraform_code": "# Generated code...",
  "provider": "aws",
  "resources": [...]
}
```

### Health Check

```bash
GET /health
curl http://localhost:8000/health
```

---

## 🛠️ Development Commands

All commands from repository root:

```bash
# Backend
make backend-up          # Start backend services
make backend-rebuild     # Rebuild after code changes
make backend-logs        # View logs
make backend-down        # Stop backend

# Frontend
make ui-install         # Install dependencies
make ui-dev             # Start dev server
make ui-build           # Production build

# Cleanup
make clean              # Stop all services
```

---

## 🐛 Troubleshooting

### Backend not starting
```bash
cd ai-iac-platform/infra
docker-compose logs -f
docker-compose down && docker-compose up --build
```

### Frontend can't connect
1. Check backend: `curl http://localhost:8000/health`
2. Verify CORS in `apps/api-gateway/app/main.py`
3. Use `http://localhost:5173` (not 127.0.0.1)

### File upload failing
1. Max file size: 10MB
2. Supported formats: PNG, JPEG, .drawio, .json
3. Check backend logs for errors

---

## 📁 Project Structure

```
ai-iac-platform/
├── apps/
│   ├── api-gateway/        # Main API
│   └── idp-ui/             # React frontend
├── services/
│   ├── vision-ai/          # Diagram analysis
│   ├── terraform-generator/# Code generation
│   ├── security-engine/    # Security scanning
│   └── cost-engine/        # Cost estimation
└── infra/
    └── docker-compose.yml  # Services
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Credits

- [Terraform](https://www.terraform.io/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- Community Terraform Modules

---

<div align="center">

**Made with ❤️ by the AI IaC Platform Team**

</div>