#!/bin/bash
# Execute rebuild and restart - run this script

set -e

echo "=========================================="
echo "REBUILD & RESTART DOCKER CONTAINERS"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Rebuild Backend JAR
echo -e "${YELLOW}[1/6]${NC} Rebuilding Backend JAR..."
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

if command -v mvn &> /dev/null; then
    mvn clean package -DskipTests
    echo -e "${GREEN}✓${NC} Backend JAR rebuilt"
else
    echo -e "${YELLOW}⚠${NC} Maven tidak ditemukan. Menggunakan JAR yang ada."
    echo "   Pastikan untuk rebuild JAR manual jika diperlukan: mvn clean package -DskipTests"
fi

# Step 2: Build Backend Docker Image
echo ""
echo -e "${YELLOW}[2/6]${NC} Building Backend Docker Image..."
docker build -t hr-backend:latest -f dockerfile .
echo -e "${GREEN}✓${NC} Backend image built"

# Step 3: Rebuild Frontend
echo ""
echo -e "${YELLOW}[3/6]${NC} Building Frontend..."
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan/frontend

if command -v npm &> /dev/null; then
    npm run build
    echo -e "${GREEN}✓${NC} Frontend built"
else
    echo -e "${YELLOW}⚠${NC} NPM tidak ditemukan. Menggunakan dist yang ada."
    echo "   Pastikan untuk rebuild frontend manual jika diperlukan: npm run build"
fi

# Step 4: Build Frontend Docker Image
echo ""
echo -e "${YELLOW}[4/6]${NC} Building Frontend Docker Image..."
docker build -t hr-frontend:latest -f dockerfile .
echo -e "${GREEN}✓${NC} Frontend image built"

# Step 5: Find Containers
echo ""
echo -e "${YELLOW}[5/6]${NC} Finding containers..."

BACKEND_CONTAINER=$(docker ps --filter "publish=8081" --format "{{.Names}}" 2>/dev/null | head -1)
if [ -z "$BACKEND_CONTAINER" ]; then
    BACKEND_CONTAINER=$(docker ps -a --format "{{.Names}}" 2>/dev/null | grep -iE "(backend|hr|api|8081)" | head -1)
fi

FRONTEND_CONTAINER=$(docker ps --filter "publish=8083" --format "{{.Names}}" 2>/dev/null | head -1)
if [ -z "$FRONTEND_CONTAINER" ]; then
    FRONTEND_CONTAINER=$(docker ps -a --format "{{.Names}}" 2>/dev/null | grep -iE "(frontend|tny|8083)" | head -1)
fi

if [ -z "$BACKEND_CONTAINER" ]; then
    BACKEND_CONTAINER="hr-backend"
    echo "   Backend container tidak ditemukan, akan menggunakan nama: $BACKEND_CONTAINER"
else
    echo "   Backend container: $BACKEND_CONTAINER"
fi

if [ -z "$FRONTEND_CONTAINER" ]; then
    FRONTEND_CONTAINER="hr-frontend"
    echo "   Frontend container tidak ditemukan, akan menggunakan nama: $FRONTEND_CONTAINER"
else
    echo "   Frontend container: $FRONTEND_CONTAINER"
fi

# Step 6: Restart Containers
echo ""
echo -e "${YELLOW}[6/6]${NC} Restarting containers..."

# Backend
echo "   Stopping backend container..."
docker stop "$BACKEND_CONTAINER" 2>/dev/null || true
echo "   Removing backend container..."
docker rm "$BACKEND_CONTAINER" 2>/dev/null || true
echo "   Starting new backend container (volume hr-uploads for logo/foto)..."
docker run -d -p 8081:8080 -v hr-uploads:/app/uploads --name "$BACKEND_CONTAINER" --restart unless-stopped hr-backend:latest
echo -e "${GREEN}✓${NC} Backend restarted"

# Frontend
echo "   Stopping frontend container..."
docker stop "$FRONTEND_CONTAINER" 2>/dev/null || true
echo "   Removing frontend container..."
docker rm "$FRONTEND_CONTAINER" 2>/dev/null || true
echo "   Starting new frontend container..."
docker run -d -p 8083:80 --name "$FRONTEND_CONTAINER" --restart unless-stopped hr-frontend:latest
echo -e "${GREEN}✓${NC} Frontend restarted"

echo ""
echo "=========================================="
echo -e "${GREEN}SELESAI!${NC}"
echo "=========================================="
echo ""
echo "Status containers:"
docker ps --filter "name=$BACKEND_CONTAINER" --filter "name=$FRONTEND_CONTAINER" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Untuk melihat logs:"
echo "  docker logs $BACKEND_CONTAINER"
echo "  docker logs $FRONTEND_CONTAINER"
echo ""
echo "Test CORS di browser: https://tny.uctech.online"
