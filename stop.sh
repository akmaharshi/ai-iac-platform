#!/bin/bash

# AI IaC Platform - Stop Script
# This script stops all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info "Stopping AI IaC Platform..."

# Stop frontend
if [ -f /tmp/iac-frontend.pid ]; then
    print_info "Stopping frontend..."
    kill $(cat /tmp/iac-frontend.pid) 2>/dev/null || true
    rm /tmp/iac-frontend.pid
    print_success "Frontend stopped"
fi

# Stop backend services
print_info "Stopping backend services..."
cd ai-iac-platform/infra
docker-compose down
cd ../..

print_success "All services stopped!"
