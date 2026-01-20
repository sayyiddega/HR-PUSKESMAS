#!/bin/bash

# Script deployment untuk HR System via SSH
# Usage: ./deploy.sh [server_user@server_host] [deploy_path]

set -e

# Colors untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Konfigurasi default
SERVER="${1:-user@your-server.com}"
DEPLOY_PATH="${2:-/opt/hr-system}"
PROJECT_NAME="HR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deploying ${PROJECT_NAME} to ${SERVER}${NC}"
echo -e "${GREEN}========================================${NC}"

# Validasi
if [ "$SERVER" == "user@your-server.com" ]; then
    echo -e "${RED}Error: Please provide server address${NC}"
    echo "Usage: ./deploy.sh user@server.com [/opt/hr-system]"
    exit 1
fi

# Test SSH connection
echo -e "${YELLOW}Testing SSH connection...${NC}"
ssh -o ConnectTimeout=10 "$SERVER" "echo 'SSH connection OK'" || {
    echo -e "${RED}Error: Cannot connect to server${NC}"
    exit 1
}

# Buat direktori deployment di server
echo -e "${YELLOW}Creating deployment directory...${NC}"
ssh "$SERVER" "mkdir -p $DEPLOY_PATH"

# Copy files ke server (exclude node_modules, target, dll)
echo -e "${YELLOW}Copying files to server...${NC}"
rsync -avz --progress \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='target' \
    --exclude='frontend/node_modules' \
    --exclude='frontend/dist' \
    --exclude='.idea' \
    --exclude='.vscode' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='uploads' \
    --exclude='Archive.zip' \
    ./ "$SERVER:$DEPLOY_PATH/"

# Copy .env jika ada
if [ -f .env ]; then
    echo -e "${YELLOW}Copying .env file...${NC}"
    scp .env "$SERVER:$DEPLOY_PATH/.env"
else
    echo -e "${YELLOW}Warning: .env file not found. Using .env.example${NC}"
    if [ -f .env.example ]; then
        scp .env.example "$SERVER:$DEPLOY_PATH/.env.example"
        ssh "$SERVER" "cd $DEPLOY_PATH && cp .env.example .env && echo 'Please edit .env file with your configuration'"
    fi
fi

# Deploy di server
echo -e "${YELLOW}Deploying on server...${NC}"
ssh "$SERVER" << EOF
    set -e
    cd $DEPLOY_PATH
    
    echo "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "Installing Docker Compose..."
        # Docker Compose V2 is included with Docker Desktop, but for Linux:
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "Stopping existing containers..."
    docker compose down || true
    
    echo "Building and starting containers..."
    docker compose up -d --build
    
    echo "Waiting for services to be healthy..."
    sleep 10
    
    echo "Checking container status..."
    docker compose ps
    
    echo "Showing logs (last 50 lines)..."
    docker compose logs --tail=50
EOF

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. SSH to server: ssh $SERVER"
echo "2. Check logs: cd $DEPLOY_PATH && docker compose logs -f"
echo "3. Check status: cd $DEPLOY_PATH && docker compose ps"
echo "4. Edit .env if needed: cd $DEPLOY_PATH && nano .env"
echo "5. Restart if needed: cd $DEPLOY_PATH && docker compose restart"
