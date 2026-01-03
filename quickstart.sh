#!/bin/bash

# AI IaC Platform - Quick Start Script
# This script sets up and runs the entire platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "============================================="
    echo "  AI IaC Platform - Quick Start"
    echo "============================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker found"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose found"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (>= 18.0) first."
        exit 1
    fi
    print_success "Node.js found ($(node --version))"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_success "npm found ($(npm --version))"
}

start_backend() {
    print_info "Starting backend services..."

    cd ai-iac-platform/infra

    # Stop any existing containers
    docker-compose down 2>/dev/null || true

    # Build and start services
    docker-compose up --build -d

    if [ $? -eq 0 ]; then
        print_success "Backend services started successfully"
    else
        print_error "Failed to start backend services"
        exit 1
    fi

    cd ../..
}

wait_for_backend() {
    print_info "Waiting for backend to be ready..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Backend is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "Backend failed to start in time"
    return 1
}

setup_frontend() {
    print_info "Setting up frontend..."

    cd ai-iac-platform/apps/idp-ui

    # Install dependencies
    npm install

    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi

    cd ../../..
}

start_frontend() {
    print_info "Starting frontend development server..."

    cd ai-iac-platform/apps/idp-ui

    # Start dev server in background
    npm run dev &
    FRONTEND_PID=$!

    echo $FRONTEND_PID > /tmp/iac-frontend.pid

    print_success "Frontend started (PID: $FRONTEND_PID)"

    cd ../../..
}

print_access_info() {
    echo ""
    echo -e "${GREEN}"
    echo "============================================="
    echo "  Platform is ready! 🚀"
    echo "============================================="
    echo -e "${NC}"
    echo ""
    echo "Access the application:"
    echo "  🌐 Frontend UI:  http://localhost:5173"
    echo "  🔌 API Gateway:  http://localhost:8000"
    echo "  📚 API Docs:     http://localhost:8000/docs"
    echo "  👁️  Vision AI:    http://localhost:8001"
    echo ""
    echo "To stop the platform:"
    echo "  Press Ctrl+C or run: ./stop.sh"
    echo ""
}

cleanup() {
    print_info "Cleaning up..."

    # Kill frontend if it's running
    if [ -f /tmp/iac-frontend.pid ]; then
        kill $(cat /tmp/iac-frontend.pid) 2>/dev/null || true
        rm /tmp/iac-frontend.pid
    fi

    # Stop Docker containers
    cd ai-iac-platform/infra
    docker-compose down
    cd ../..
}

# Main execution
main() {
    print_header

    # Trap to cleanup on exit
    trap cleanup EXIT INT TERM

    check_prerequisites
    echo ""

    start_backend
    echo ""

    wait_for_backend
    echo ""

    setup_frontend
    echo ""

    start_frontend
    echo ""

    sleep 5  # Wait for frontend to start

    print_access_info

    # Keep script running
    print_info "Press Ctrl+C to stop all services..."

    # Wait forever (or until interrupted)
    tail -f /dev/null
}

# Run main function
main
