#!/bin/bash

# AI IaC Platform - Debug Script
# This script checks the status of all services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}AI IaC Platform - Diagnostic Check${NC}"
echo "======================================"
echo ""

# Check Docker containers
echo -e "${YELLOW}1. Checking Docker containers...${NC}"
cd ai-iac-platform/infra
docker-compose ps
echo ""

# Check API Gateway health
echo -e "${YELLOW}2. Checking API Gateway (http://localhost:8000)${NC}"
if curl -f http://localhost:8000/health 2>/dev/null; then
    echo -e "${GREEN}✓ API Gateway is healthy${NC}"
else
    echo -e "${RED}✗ API Gateway is not responding${NC}"
    echo "Try: cd ai-iac-platform/infra && docker-compose logs api-gateway"
fi
echo ""

# Check Vision AI
echo -e "${YELLOW}3. Checking Vision AI (http://localhost:8001)${NC}"
if curl -f http://localhost:8001/ 2>/dev/null; then
    echo -e "${GREEN}✓ Vision AI is healthy${NC}"
else
    echo -e "${RED}✗ Vision AI is not responding${NC}"
    echo "Try: cd ai-iac-platform/infra && docker-compose logs vision-ai"
fi
echo ""

# Check API endpoints
echo -e "${YELLOW}4. Checking API endpoints${NC}"
echo "GET /"
curl -s http://localhost:8000/ | jq . || echo "Failed"
echo ""

echo "GET /health"
curl -s http://localhost:8000/health | jq . || echo "Failed"
echo ""

# Check container logs for errors
echo -e "${YELLOW}5. Recent container logs${NC}"
echo "API Gateway logs:"
docker-compose logs --tail=20 api-gateway
echo ""

echo "Vision AI logs:"
docker-compose logs --tail=20 vision-ai
echo ""

# Check network
echo -e "${YELLOW}6. Checking Docker network${NC}"
docker network ls | grep iac-network || echo "Network not found"
echo ""

# Recommendations
echo -e "${BLUE}======================================"
echo "Recommendations:"
echo "======================================"
echo "If services are not running:"
echo "  1. cd ai-iac-platform/infra"
echo "  2. docker-compose down"
echo "  3. docker-compose up --build -d"
echo ""
echo "To view live logs:"
echo "  docker-compose logs -f"
echo ""
echo "To test API manually:"
echo "  curl http://localhost:8000/health"
echo -e "${NC}"
