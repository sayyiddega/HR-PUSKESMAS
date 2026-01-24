#!/bin/bash
# ============================================================
# REBUILD + RESTART (BACKEND & FRONTEND) + CLOUDFLARE TUNNEL
#
# Tujuan:
# - Jalankan rebuild backend & frontend (pakai REBUILD_AND_RESTART_FINAL.sh)
# - Setelah itu hidupkan Cloudflare Tunnel dalam container Docker
#   sehingga akses HTTPS publik lewat Cloudflare (plug & play).
#
# Prasyarat:
# - Docker sudah ter-install dan bisa jalan (sama seperti script FINAL).
# - Cloudflare Tunnel sudah dibuat di dashboard Cloudflare,
#   dan Anda punya "Tunnel Token" (format panjang, dimulai dengan eyJ...).
# - Simpan token tersebut di file .env di root project:
#     CF_TUNNEL_TOKEN=eyJ...
# - Mapping hostname -> service (8081/8083) diatur di dashboard Cloudflare,
#   BUKAN di script ini.
#
# Catatan:
# - Script ini TIDAK mengubah konfigurasi REBUILD_AND_RESTART_FINAL.sh
# - Backend tetap listen di 8081 (HTTP), frontend di 8083 (HTTP).
#   Cloudflare Tunnel yang memberikan SSL di depan.
# ============================================================

set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "==============================================="
echo "REBUILD + RESTART + CLOUDFLARE TUNNEL"
echo "==============================================="
echo ""

# -------------------------------------------
# 1) Jalankan script FINAL standar
# -------------------------------------------
echo -e "${YELLOW}[1/3]${NC} Menjalankan REBUILD_AND_RESTART_FINAL.sh..."
"${BASE_DIR}/REBUILD_AND_RESTART_FINAL.sh"
echo ""

# -------------------------------------------
# 2) Muat CF_TUNNEL_TOKEN dari .env (jika ada)
# -------------------------------------------
ENV_FILE="${BASE_DIR}/.env"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z0-9_]+=' "$ENV_FILE" | xargs) || true
fi

if [ -z "${CF_TUNNEL_TOKEN:-}" ]; then
  echo -e "${YELLOW}Peringatan:${NC} CF_TUNNEL_TOKEN belum di-set."
  echo "Silakan set di .env:"
  echo "  CF_TUNNEL_TOKEN=eyJxxxxxxxx"
  echo ""
  echo "Lewati start Cloudflare Tunnel."
  exit 0
fi

# -------------------------------------------
# 3) Start / Restart container Cloudflare Tunnel
# -------------------------------------------
echo -e "${YELLOW}[2/3]${NC} Stop container cloudflared (jika ada)..."
docker stop cloudflared 2>/dev/null || true
docker rm cloudflared 2>/dev/null || true

echo -e "${YELLOW}[3/3]${NC} Start Cloudflare Tunnel container..."

# Catatan:
# - Menggunakan network host agar cloudflared bisa mengakses 127.0.0.1:8081/8083
# - Konfigurasi mapping hostname -> service diatur di dashboard Cloudflare.
docker run -d \
  --name cloudflared \
  --restart unless-stopped \
  --network host \
  cloudflare/cloudflared:latest \
  tunnel run --token "${CF_TUNNEL_TOKEN}"

echo -e "${GREEN}✓${NC} Cloudflare Tunnel berjalan sebagai container 'cloudflared'"
echo ""

echo "Status containers:"
docker ps --filter "name=hr-backend" --filter "name=hr-frontend" --filter "name=cloudflared" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Catatan:"
echo "- Backend  lokal : http://localhost:8081"
echo "- Frontend lokal : http://localhost:8083"
echo "- Akses publik HTTPS diatur lewat Cloudflare Tunnel (hostname di dashboard Cloudflare)."

