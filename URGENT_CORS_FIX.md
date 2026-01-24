# ⚠️ URGENT: Fix CORS 403 Forbidden - Reverse Proxy Issue

## 🔴 Masalah Saat Ini

Error: **403 Forbidden** dari server **OpenResty** (reverse proxy)
- Request tidak sampai ke Spring Boot
- CORS headers tidak terkirim karena request di-block di level reverse proxy
- Error: "No 'Access-Control-Allow-Origin' header is present"

## ✅ Perbaikan yang Sudah Dilakukan di Code

1. ✅ **Custom CORS Filter** (`CorsFilter.java`) - Filter dengan priority tertinggi
2. ✅ **SecurityConfig** - CORS configuration lengkap
3. ✅ **JwtAuthFilter** - Skip untuk `/api/auth/**` dan OPTIONS

## 🔧 SOLUSI: Konfigurasi OpenResty/Nginx Reverse Proxy

**MASALAH UTAMA:** Reverse proxy (OpenResty) memblokir request sebelum sampai ke Spring Boot.

### Opsi 1: Biarkan Spring Boot Handle CORS (RECOMMENDED)

Edit konfigurasi OpenResty untuk `apitny.uctech.online`:

```nginx
server {
    listen 443 ssl http2;
    server_name apitny.uctech.online;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # JANGAN set CORS headers di sini - biarkan Spring Boot handle
    # Hanya proxy request ke backend
    
    location / {
        # Proxy ke backend container
        proxy_pass http://127.0.0.1:8081;  # atau IP container backend
        proxy_http_version 1.1;
        
        # Headers untuk proxy
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # PENTING: Teruskan semua headers termasuk Origin
        proxy_pass_request_headers on;
        proxy_set_header Origin $http_origin;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

### Opsi 2: Handle CORS di Reverse Proxy (Jika Opsi 1 Tidak Bisa)

Jika tidak bisa mengubah konfigurasi proxy, set CORS di OpenResty:

```nginx
server {
    listen 443 ssl http2;
    server_name apitny.uctech.online;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Handle CORS preflight
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 3600 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    location / {
        # Proxy ke backend
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers untuk actual request
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Expose-Headers' 'Authorization' always;
    }
}
```

## 📋 Langkah-langkah

### 1. Rebuild Backend dengan Custom CORS Filter

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

# Build JAR
mvn clean package -DskipTests

# Build Docker image
docker build -t hr-backend:latest -f dockerfile .
```

### 2. Restart Backend Container

```bash
docker stop hr-app
docker rm hr-app
docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
```

### 3. Update Konfigurasi OpenResty

Edit file konfigurasi OpenResty (biasanya di `/etc/nginx/conf.d/` atau `/usr/local/openresty/nginx/conf/`):

```bash
# Cari file konfigurasi untuk apitny.uctech.online
sudo find /etc /usr/local -name "*apitny*" -o -name "*uctech*" 2>/dev/null

# Edit file tersebut dengan salah satu opsi di atas
sudo nano /path/to/apitny.conf
```

### 4. Reload OpenResty/Nginx

```bash
# Test konfigurasi
sudo nginx -t
# atau
sudo /usr/local/openresty/nginx/sbin/nginx -t

# Reload
sudo nginx -s reload
# atau
sudo /usr/local/openresty/nginx/sbin/nginx -s reload
```

### 5. Test

```bash
# Test OPTIONS (preflight)
curl -X OPTIONS https://apitny.uctech.online/api/auth/login \
  -H "Origin: https://tny.uctech.online" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# Test POST
curl -X POST https://apitny.uctech.online/api/auth/login \
  -H "Origin: https://tny.uctech.online" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

## 🔍 Debugging

### Cek Logs Backend

```bash
docker logs hr-app -f
```

### Cek Logs OpenResty/Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /usr/local/openresty/nginx/logs/error.log
```

### Cek Apakah Request Sampai ke Backend

Di backend logs, seharusnya ada log request. Jika tidak ada, berarti request di-block di reverse proxy.

## ⚠️ Catatan Penting

1. **Jangan set CORS headers di kedua tempat** (reverse proxy DAN Spring Boot) karena akan conflict
2. **Opsi 1 (biarkan Spring Boot handle) lebih baik** karena lebih fleksibel
3. **Pastikan OPTIONS request diteruskan** ke backend, jangan di-handle di reverse proxy saja
4. **Setelah update konfigurasi, reload nginx/openresty** agar perubahan ter-apply

## 🎯 Expected Result

Setelah perbaikan:
- ✅ OPTIONS request return 200/204 dengan CORS headers
- ✅ POST request ke `/api/auth/login` return 200 (bukan 403)
- ✅ Response headers ada `Access-Control-Allow-Origin: https://tny.uctech.online`
- ✅ Tidak ada error CORS di browser console

## 📞 Jika Masih Error

1. Cek apakah request sampai ke backend (lihat logs)
2. Cek konfigurasi OpenResty sudah benar
3. Cek firewall/security rules tidak memblokir
4. Cek SSL certificate valid
5. Test dengan curl untuk isolate masalah
