# ⚡ Quick Fix CORS - Nginx Proxy Manager

## Setup
- **Nginx Proxy Manager** untuk reverse proxy
- **Cloudflare** (DNS only, proxy OFF) ✅

## 🔧 Langkah Cepat

### 1. Login ke Nginx Proxy Manager
- Buka: `http://your-server-ip:81`
- Login dengan credentials Anda

### 2. Edit Proxy Host untuk `apitny.uctech.online`

1. **Buka "Proxy Hosts"** → Cari `apitny.uctech.online` → **Edit**

2. **Tab "Details"**:
   - Forward Hostname/IP: `127.0.0.1` (atau IP container backend)
   - Forward Port: `8081`
   - Forward Scheme: `http`
   - ✅ **Block Common Exploits**: **OFF** (sementara untuk testing)
   - ✅ **Websockets Support**: **ON**

3. **Tab "Advanced"** - Paste ini di "Custom Nginx Configuration":

```nginx
# Proxy headers - HARUS ada
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

4. **Klik "Save"** → **"Test"** → Jika OK, **"Save"** lagi

### 3. Rebuild & Restart Backend

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

# Build (jika Maven tersedia)
mvn clean package -DskipTests

# Build Docker image
docker build -t hr-backend:latest -f dockerfile .

# Restart container
docker stop hr-app
docker rm hr-app
docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
```

### 4. Test

Buka browser: `https://tny.uctech.online` dan coba login.

## 🔍 Jika Masih Error 403

### Opsi A: Set CORS di Nginx Proxy Manager (Fallback) - FIXED

Di tab **"Advanced"**, gunakan ini (lebih aman, tidak pakai `if` atau `location`):

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

# CORS headers - hanya untuk response, biarkan Spring Boot handle preflight
add_header 'Access-Control-Allow-Origin' '$http_origin' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Expose-Headers' 'Authorization' always;
```

**CATATAN**: 
- Konfigurasi di atas **TIDAK** handle OPTIONS preflight di nginx. Biarkan Spring Boot handle OPTIONS request.
- **JANGAN** tambahkan `location` block di custom config - Nginx Proxy Manager sudah handle routing
- **JANGAN** tambahkan `if` statement - bisa membuat nginx crash

### Opsi B: Cek Logs

```bash
# Backend logs
docker logs hr-app -f

# Nginx Proxy Manager logs (jika bisa akses)
sudo tail -f /data/logs/error.log
```

## ✅ Checklist

- [ ] Nginx Proxy Manager proxy host sudah dikonfigurasi
- [ ] Custom nginx config sudah ditambahkan
- [ ] Backend sudah di-rebuild
- [ ] Backend container sudah di-restart
- [ ] Test login dari frontend

## 📝 Catatan

- **Cloudflare**: Pastikan proxy OFF (DNS only) - sudah benar ✅
- **Spring Boot**: Sudah ada `CorsFilter.java` yang handle CORS
- **Nginx Proxy Manager**: Hanya perlu meneruskan request, biarkan Spring Boot handle CORS
