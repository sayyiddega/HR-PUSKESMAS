# Fix CORS 403 Forbidden Error

## Masalah
Request dari `https://tny.uctech.online` ke `https://apitny.uctech.online/api/auth/login` mendapatkan error **403 Forbidden**.

## Penyebab
Server menggunakan **OpenResty** (reverse proxy) di depan Spring Boot. Ada beberapa kemungkinan:
1. Reverse proxy memblokir request sebelum sampai ke Spring Boot
2. CORS preflight (OPTIONS) tidak di-handle dengan benar
3. Konfigurasi security di reverse proxy terlalu ketat

## Perbaikan yang Sudah Dilakukan

### 1. Backend CORS Configuration (`SecurityConfig.java`)
- ✅ Allow all headers untuk kompatibilitas maksimal
- ✅ Tambahkan CORS headers pada error response (401/403)
- ✅ Pastikan OPTIONS request di-permitAll
- ✅ Pastikan `/api/auth/**` di-permitAll

### 2. JWT Auth Filter (`JwtAuthFilter.java`)
- ✅ Skip filter untuk OPTIONS request (CORS preflight)
- ✅ Skip filter untuk `/api/auth/**` endpoints

## Langkah Selanjutnya

### 1. Rebuild Backend
```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan
mvn clean package -DskipTests
docker build -t hr-backend:latest -f dockerfile .
```

### 2. Restart Backend Container
```bash
# Cari container name
docker ps --filter "publish=8081" --format "{{.Names}}"

# Restart (ganti <container-name> dengan nama yang ditemukan)
docker stop <container-name>
docker rm <container-name>
docker run -d -p 8081:8080 --name <container-name> --restart unless-stopped hr-backend:latest
```

### 3. Konfigurasi Reverse Proxy (OpenResty/Nginx)

Jika masih ada masalah 403, kemungkinan perlu konfigurasi di level reverse proxy. Pastikan konfigurasi OpenResty/Nginx untuk `apitny.uctech.online`:

```nginx
server {
    listen 443 ssl;
    server_name apitny.uctech.online;

    # SSL configuration
    # ...

    location / {
        proxy_pass http://localhost:8081;  # atau IP container backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers - biarkan Spring Boot handle
        # JANGAN set CORS headers di sini jika Spring Boot sudah handle
        # Karena akan conflict dengan Spring Boot CORS
        
        # Pastikan OPTIONS request diteruskan ke backend
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
    }
}
```

**ATAU lebih baik**, biarkan Spring Boot handle semua CORS dan hanya proxy request:

```nginx
server {
    listen 443 ssl;
    server_name apitny.uctech.online;

    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Pastikan semua request (termasuk OPTIONS) diteruskan
        proxy_pass_request_headers on;
    }
}
```

### 4. Test CORS

Setelah rebuild dan restart:

1. Buka browser: `https://tny.uctech.online`
2. Buka Developer Tools → Network tab
3. Coba login
4. Cek request ke `https://apitny.uctech.online/api/auth/login`
5. Pastikan:
   - Request method: POST (bukan OPTIONS yang gagal)
   - Status: 200 OK (bukan 403)
   - Response headers ada: `Access-Control-Allow-Origin: https://tny.uctech.online`

### 5. Debugging

Jika masih error 403:

1. **Cek logs backend:**
   ```bash
   docker logs <backend-container-name>
   ```

2. **Test langsung ke backend (bypass reverse proxy):**
   ```bash
   curl -X POST https://apitny.uctech.online/api/auth/login \
     -H "Content-Type: application/json" \
     -H "Origin: https://tny.uctech.online" \
     -d '{"email":"admin@puskesmas.id","password":"admin123"}'
   ```

3. **Cek apakah OPTIONS request berhasil:**
   ```bash
   curl -X OPTIONS https://apitny.uctech.online/api/auth/login \
     -H "Origin: https://tny.uctech.online" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: content-type" \
     -v
   ```

4. **Cek konfigurasi reverse proxy:**
   - Pastikan tidak ada rule yang memblokir request
   - Pastikan OPTIONS request diteruskan ke backend
   - Pastikan tidak ada konfigurasi security yang terlalu ketat

## Catatan Penting

- **Jangan set CORS headers di reverse proxy** jika Spring Boot sudah handle CORS, karena akan conflict
- **Biarkan Spring Boot handle semua CORS** dan reverse proxy hanya sebagai proxy
- **Pastikan OPTIONS request diteruskan** ke backend, jangan di-handle di reverse proxy

## Verifikasi

Setelah semua perbaikan, pastikan:
- ✅ OPTIONS request ke `/api/auth/login` return 200 dengan CORS headers
- ✅ POST request ke `/api/auth/login` return 200 (bukan 403)
- ✅ Response headers ada `Access-Control-Allow-Origin: https://tny.uctech.online`
- ✅ Tidak ada error CORS di browser console
