# 🔧 Fix 404 Not Found - CORS Sudah Bekerja!

## ✅ Progress
- **CORS sudah bekerja!** Headers muncul:
  - `access-control-allow-origin: https://tny.uctech.online`
  - `access-control-allow-credentials: true`
  - `access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`

## 🔴 Masalah Baru: 404 Not Found

Request ke `https://apitny.uctech.online/api/auth/login` return **404 Not Found**.

## 🔍 Kemungkinan Penyebab

1. **Backend container tidak berjalan**
2. **Nginx Proxy Manager tidak meneruskan path dengan benar**
3. **Backend belum di-rebuild dengan perubahan terbaru**

## ✅ Solusi

### 1. Cek Backend Container

```bash
# Cek apakah container berjalan
docker ps | grep hr-app

# Jika tidak ada, cek semua container
docker ps -a | grep hr
```

### 2. Pastikan Backend Container Berjalan

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

# Cek apakah container ada
docker ps -a | grep hr-app

# Jika container tidak berjalan, start
docker start hr-app

# Atau jika container tidak ada, buat baru
docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
```

### 3. Test Backend Langsung (Bypass Nginx Proxy Manager)

```bash
# Test langsung ke backend container
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected**: Status 200 dengan response JSON

Jika ini berhasil, berarti masalahnya di Nginx Proxy Manager.

### 4. Perbaiki Konfigurasi Nginx Proxy Manager

Masalahnya mungkin di **path routing**. Pastikan di Nginx Proxy Manager:

1. **Tab "Details"**:
   - Forward Hostname/IP: `127.0.0.1` (atau IP container)
   - Forward Port: `8081`
   - ✅ **Preserve Host**: **OFF** (atau ON, coba kedua-duanya)
   - ✅ **Websockets Support**: **ON**

2. **Tab "Advanced"** - Pastikan konfigurasi ini ada:

```nginx
# Proxy headers - HARUS ada
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Origin $http_origin;
proxy_pass_request_headers on;

# PENTING: Pastikan path diteruskan dengan benar
# Jangan tambahkan atau hapus path
# proxy_pass harus ke http://127.0.0.1:8081/ (tanpa path tambahan)

# Buffer settings
proxy_buffering off;
proxy_request_buffering off;

# Timeout settings
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

**CATATAN PENTING**: 
- Jangan tambahkan path di `proxy_pass` di custom config
- Nginx Proxy Manager sudah handle `proxy_pass` di konfigurasi default
- Custom config hanya untuk headers dan settings tambahan

### 5. Rebuild Backend (Jika Perlu)

Jika backend belum di-rebuild dengan perubahan terbaru:

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

# Build JAR (jika Maven tersedia)
mvn clean package -DskipTests

# Build Docker image
docker build -t hr-backend:latest -f dockerfile .

# Restart container
docker stop hr-app
docker rm hr-app
docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
```

### 6. Cek Logs

```bash
# Backend logs
docker logs hr-app -f

# Cari error atau request yang masuk
# Jika tidak ada request yang masuk, berarti Nginx Proxy Manager tidak meneruskan
```

## 🔍 Debugging

### Test 1: Backend Langsung
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}'
```

**Expected**: `{"data":{"accessToken":"...","email":"...","role":"..."}}`

### Test 2: Via Nginx Proxy Manager
```bash
curl -X POST https://apitny.uctech.online/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected**: Status 200, bukan 404

### Test 3: Cek Endpoint Lain
```bash
# Test root endpoint (jika ada)
curl https://apitny.uctech.online/

# Test swagger (jika ada)
curl https://apitny.uctech.online/swagger-ui.html
```

## ⚠️ Common Issues

### Issue 1: Path Tidak Diteruskan
**Gejala**: 404 Not Found
**Solusi**: Pastikan Nginx Proxy Manager tidak menambahkan atau menghapus path di `proxy_pass`

### Issue 2: Backend Tidak Berjalan
**Gejala**: Connection refused atau timeout
**Solusi**: Start container backend

### Issue 3: Port Salah
**Gejala**: Connection refused
**Solusi**: Pastikan Forward Port di Nginx Proxy Manager = 8081

## ✅ Checklist

- [ ] Backend container berjalan (`docker ps | grep hr-app`)
- [ ] Test backend langsung berhasil (curl ke localhost:8081)
- [ ] Nginx Proxy Manager Forward Port = 8081
- [ ] Nginx Proxy Manager Forward Hostname/IP = 127.0.0.1
- [ ] Custom nginx config sudah benar (tidak ada `proxy_pass` di custom config)
- [ ] Test via domain berhasil (curl ke apitny.uctech.online)

## 🎯 Expected Result

Setelah perbaikan:
- ✅ Request ke `https://apitny.uctech.online/api/auth/login` return 200
- ✅ Response JSON dengan `accessToken`
- ✅ CORS headers tetap muncul
- ✅ Login berhasil dari frontend
