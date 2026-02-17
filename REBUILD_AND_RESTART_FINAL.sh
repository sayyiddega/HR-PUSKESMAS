#!/bin/bash
# ============================================================
# FINAL REBUILD SCRIPT (Backend + Frontend + Docker Restart)
#
# Catatan:
# - Script ini dibuat agar TETAP sama (pakem) untuk deploy/migrasi.
# - Menggunakan Docker image resmi untuk Maven & Node
#   -> Host tidak perlu ter-install Java 17 atau Node 20.
# - Menjaga storage uploads lewat volume: hr-uploads:/app/uploads
# - Mohon jangan di-edit kecuali Anda memang ingin mengubah flow.
# ============================================================

set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "FINAL REBUILD & RESTART (BACKEND + FRONTEND)"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# -------------------------------------------
# 0) Cek & instal dasar (docker, java, mvn, npm) jika belum ada
#    - Script ini tetap menggunakan Docker Maven/Node untuk build,
#      tapi punya fallback install tools lokal bila dibutuhkan.
# -------------------------------------------

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

install_if_missing_apt() {
  local cmd="$1"
  local pkgs="$2"
  if has_cmd "$cmd"; then
    return 0
  fi
  if has_cmd apt-get; then
    echo -e "${YELLOW}Installing ${pkgs} via apt-get (requires sudo)...${NC}"
    sudo apt-get update -y && sudo apt-get install -y ${pkgs} || echo -e "${YELLOW}Gagal install ${pkgs}, lanjut dengan konfigurasi yang ada.${NC}"
  else
    echo -e "${YELLOW}apt-get tidak tersedia. Lewati instalasi ${pkgs}.${NC}"
  fi
}

# Pastikan docker tersedia
if ! has_cmd docker; then
  install_if_missing_apt docker "docker.io"
  if ! has_cmd docker; then
    echo "ERROR: Docker tidak ditemukan dan tidak bisa di-install otomatis."
    echo "Silakan install Docker secara manual lalu jalankan ulang script ini."
    exit 1
  fi
fi

# Opsional: install java/maven/node/npm jika belum (untuk kebutuhan lain di server)
install_if_missing_apt java "default-jre"
install_if_missing_apt mvn "maven"
install_if_missing_apt npm "nodejs npm"

ENV_FILE="${BASE_DIR}/.env"
if [ -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}Memuat konfigurasi dari .env${NC}"
  ENV_FILE_ARG="--env-file $ENV_FILE"
else
  ENV_FILE_ARG=""
fi

# -------------------------------------------
# 1) Build Backend JAR via Docker Maven
# -------------------------------------------
echo -e "${YELLOW}[1/6]${NC} Build backend JAR (Docker Maven)..."
docker run --rm \
  -v "${BASE_DIR}:/app" \
  -w /app \
  maven:3.8-openjdk-17 \
  mvn clean package -DskipTests
echo -e "${GREEN}✓${NC} Backend JAR built"

# -------------------------------------------
# 2) Build Backend Docker Image
# -------------------------------------------
echo ""
echo -e "${YELLOW}[2/6]${NC} Build backend Docker image..."
docker build -t hr-puskesmas-backend:latest -f "${BASE_DIR}/dockerfile" "${BASE_DIR}"
echo -e "${GREEN}✓${NC} Backend image built (hr-puskesmas-backend:latest)"

# -------------------------------------------
# 3) Build Frontend (Docker Node)
# -------------------------------------------
echo ""
echo -e "${YELLOW}[3/6]${NC} Build frontend (Docker Node)..."
docker run --rm \
  $ENV_FILE_ARG \
  -v "${BASE_DIR}/frontend:/app" \
  -w /app \
  node:20-alpine \
  sh -c "npm install && npm run build"
echo -e "${GREEN}✓${NC} Frontend built (dist/)"

# -------------------------------------------
# 4) Build Frontend Docker Image
# -------------------------------------------
echo ""
echo -e "${YELLOW}[4/6]${NC} Build frontend Docker image..."
docker build -t hr-puskesmas-frontend:latest -f "${BASE_DIR}/frontend/dockerfile" "${BASE_DIR}/frontend"
echo -e "${GREEN}✓${NC} Frontend image built (hr-puskesmas-frontend:latest)"

# -------------------------------------------
# 5) Stop & Remove Existing Containers (nama unik: tidak bentrok dengan app lain)
# -------------------------------------------
echo ""
echo -e "${YELLOW}[5/6]${NC} Stop & remove existing containers (hr-puskesmas-*)..."
docker stop hr-puskesmas-backend hr-puskesmas-frontend 2>/dev/null || true
docker rm hr-puskesmas-backend hr-puskesmas-frontend 2>/dev/null || true
echo -e "${GREEN}✓${NC} Old containers stopped & removed (if any)"

# -------------------------------------------
# 6) Start New Containers (nama & volume unik: tidak bentrok dengan app lain)
# -------------------------------------------
echo ""
echo -e "${YELLOW}[6/6]${NC} Start new containers..."

echo "   Starting backend (port 8040, volume hr-puskesmas-uploads:/app/uploads)..."
docker run -d \
  $ENV_FILE_ARG \
  -p 8040:8040 \
  -v hr-puskesmas-uploads:/app/uploads \
  --name hr-puskesmas-backend \
  --restart unless-stopped \
  hr-puskesmas-backend:latest

echo "   Starting frontend (port 8041)..."
docker run -d \
  $ENV_FILE_ARG \
  -p 8041:80 \
  --name hr-puskesmas-frontend \
  --restart unless-stopped \
  hr-puskesmas-frontend:latest

echo -e "${GREEN}✓${NC} Containers started"

echo ""
echo "=========================================="
echo -e "${GREEN}SELESAI - REBUILD & RESTART BERHASIL${NC}"
echo "=========================================="
echo ""
echo "Status containers:"
docker ps --filter "name=hr-puskesmas-backend" --filter "name=hr-puskesmas-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Catatan:"
echo "- Backend:  http://localhost:8040  (container: hr-puskesmas-backend)"
echo "- Frontend: http://localhost:8041  (container: hr-puskesmas-frontend)"
echo "- Uploads: volume hr-puskesmas-uploads (tidak bentrok dengan app lain)."
echo "- Set VITE_API_URL=http://localhost:8040/api di .env sebelum build agar frontend memanggil backend 8040."

