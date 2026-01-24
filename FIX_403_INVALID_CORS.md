# 🔧 Fix 403 "Invalid CORS request"

## 🔴 Masalah
Backend sudah online, tapi return **403 "Invalid CORS request"** saat test curl langsung.

## ✅ Solusi

### 1. Hapus Konfigurasi Nginx yang Bermasalah

**JANGAN** gunakan konfigurasi dengan `location` block atau `if` statement di Nginx Proxy Manager custom config. Itu yang membuat nginx offline.

**Gunakan konfigurasi AMAN ini saja** (di tab "Advanced"):

```nginx
# Proxy settings - HARUS ada
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Origin $http_origin;
proxy_pass_request_headers on;

# Buffer settings
proxy_buffering off;
proxy_request_buffering off;

# Timeout settings
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

**JANGAN** tambahkan:
- ❌ `location` block
- ❌ `if` statement
- ❌ `proxy_pass` (sudah di-handle Nginx Proxy Manager)

### 2. Rebuild Backend dengan CorsFilter yang Diperbaiki

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

# Build JAR
mvn clean package -DskipTests

# Build Docker image
docker build -t hr-backend:latest -f dockerfile .

# Restart container
docker stop hr-app
docker rm hr-app
docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
```

### 3. Test Lagi

```bash
# Test backend langsung
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected**: Status 200 dengan response JSON, bukan 403

### 4. Perubahan yang Sudah Dilakukan

1. ✅ **CorsFilter.java** - Diperbaiki `isAllowedOrigin()` untuk match origin dengan lebih baik
2. ✅ **QUICK_FIX_NPM.md** - Dihapus konfigurasi nginx yang bermasalah (location block)

## 🔍 Debugging

Jika masih 403, cek:

1. **Cek logs backend**:
   ```bash
   docker logs hr-app -f
   ```
   Cari log "CORS: Origin not allowed" untuk melihat origin yang ditolak

2. **Test tanpa Origin header**:
   ```bash
   curl -X POST http://localhost:8081/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@puskesmas.id","password":"admin123"}'
   ```
   Jika ini berhasil, berarti masalahnya di CORS origin matching

3. **Test dengan origin berbeda**:
   ```bash
   curl -X POST http://localhost:8081/api/auth/login \
     -H "Content-Type: application/json" \
     -H "Origin: http://tny.uctech.online" \
     -d '{"email":"admin@puskesmas.id","password":"admin123"}'
   ```

## ✅ Checklist

- [ ] Hapus konfigurasi nginx yang pakai `location` atau `if`
- [ ] Gunakan konfigurasi nginx yang aman (tanpa location/if)
- [ ] Rebuild backend dengan CorsFilter yang diperbaiki
- [ ] Restart backend container
- [ ] Test curl langsung berhasil (status 200)
- [ ] Test via domain berhasil
