# Quick Restart Commands

Karena perubahan CORS sudah dilakukan, berikut perintah untuk rebuild dan restart containers:

## Opsi 1: Menggunakan Script (Recommended)

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan
bash rebuild-restart-commands.sh
```

## Opsi 2: Manual Commands

### 1. Rebuild Backend (jika perlu rebuild JAR)
```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan
mvn clean package -DskipTests
docker build -t hr-backend:latest -f dockerfile .
```

### 2. Rebuild Frontend
```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan/frontend
npm run build
docker build -t hr-frontend:latest -f dockerfile .
```

### 3. Cari Container Names
```bash
# Cari backend container (port 8081)
docker ps --filter "publish=8081" --format "{{.Names}}"

# Cari frontend container (port 8083)
docker ps --filter "publish=8083" --format "{{.Names}}"
```

### 4. Restart Containers
```bash
# Ganti CONTAINER_NAME dengan nama yang ditemukan di step 3

# Backend
docker stop <backend-container-name>
docker rm <backend-container-name>
docker run -d -p 8081:8080 --name <backend-container-name> --restart unless-stopped hr-backend:latest

# Frontend
docker stop <frontend-container-name>
docker rm <frontend-container-name>
docker run -d -p 8083:80 --name <frontend-container-name> --restart unless-stopped hr-frontend:latest
```

## Opsi 3: Quick Restart (tanpa rebuild, hanya restart)

Jika hanya ingin restart tanpa rebuild image:

```bash
# Cari container names
BACKEND=$(docker ps --filter "publish=8081" --format "{{.Names}}")
FRONTEND=$(docker ps --filter "publish=8083" --format "{{.Names}}")

# Restart
docker restart $BACKEND
docker restart $FRONTEND
```

**Catatan:** Restart saja mungkin tidak cukup karena perubahan CORS ada di source code. Perlu rebuild image agar perubahan ter-apply.

## Verifikasi

Setelah restart, cek:
```bash
# Status containers
docker ps | grep -E "(8081|8083)"

# Logs
docker logs <backend-container-name>
docker logs <frontend-container-name>
```

## Test CORS

1. Buka browser: `https://tny.uctech.online`
2. Buka Developer Tools → Network tab
3. Coba login atau akses API
4. Pastikan tidak ada error CORS di console
