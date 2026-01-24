# 🔧 Fix CORS dengan Nginx Proxy Manager + Cloudflare

## 📋 Setup Saat Ini
- **Frontend**: `tny.uctech.online` (port 8083)
- **Backend**: `apitny.uctech.online` (port 8081)
- **Reverse Proxy**: Nginx Proxy Manager
- **CDN**: Cloudflare (DNS only, proxy OFF)

## 🔴 Masalah
403 Forbidden dari Nginx Proxy Manager karena request di-block sebelum sampai ke Spring Boot.

## ✅ Solusi: Konfigurasi Nginx Proxy Manager

### Opsi 1: Via UI Nginx Proxy Manager (RECOMMENDED)

1. **Login ke Nginx Proxy Manager**
   - Biasanya di `http://your-server-ip:81`

2. **Edit Proxy Host untuk `apitny.uctech.online`**
   - Buka **Proxy Hosts** → Pilih `apitny.uctech.online`
   - Klik **Edit**

3. **Tab "Details"**
   - **Forward Hostname/IP**: `127.0.0.1` atau IP container backend
   - **Forward Port**: `8081`
   - **Forward Scheme**: `http`
   - ✅ **Block Common Exploits**: **OFF** (untuk testing, bisa ON lagi setelah CORS fix)
   - ✅ **Websockets Support**: **ON**

4. **Tab "Advanced"** - Tambahkan Custom Nginx Configuration:

```nginx
# JANGAN set CORS headers di sini - biarkan Spring Boot handle
# Hanya pastikan request diteruskan dengan benar

# Teruskan semua headers termasuk Origin
proxy_set_header Origin $http_origin;
proxy_pass_request_headers on;

# Pastikan OPTIONS request diteruskan
# (Spring Boot akan handle CORS)

# Buffer settings untuk CORS
proxy_buffering off;
proxy_request_buffering off;
```

5. **Tab "SSL"**
   - Pastikan SSL certificate valid
   - Force SSL: ON
   - HTTP/2 Support: ON

6. **Save** dan **Test** konfigurasi

### Opsi 2: Handle CORS di Nginx Proxy Manager (Jika Opsi 1 Tidak Bekerja)

Jika masih error, set CORS di Nginx Proxy Manager:

**Tab "Advanced"** - Custom Nginx Configuration:

```nginx
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

# CORS headers untuk actual request
add_header 'Access-Control-Allow-Origin' '$http_origin' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Expose-Headers' 'Authorization' always;

# Proxy settings
proxy_set_header Origin $http_origin;
proxy_pass_request_headers on;
proxy_buffering off;
proxy_request_buffering off;
```

### Opsi 3: Edit File Konfigurasi Langsung (Advanced)

Jika perlu edit langsung file konfigurasi Nginx Proxy Manager:

1. **Cari file konfigurasi**:
```bash
# Nginx Proxy Manager biasanya di:
/data/nginx/proxy_host/
# atau
/etc/nginx/conf.d/
```

2. **Cari file untuk `apitny.uctech.online`**:
```bash
sudo find /data /etc -name "*apitny*" -o -name "*uctech*" 2>/dev/null
```

3. **Edit file tersebut** dan tambahkan konfigurasi seperti di Opsi 1 atau 2

4. **Reload Nginx**:
```bash
# Via Nginx Proxy Manager UI: klik "Test" lalu "Save"
# Atau manual:
sudo nginx -t
sudo nginx -s reload
```

## 🔍 Verifikasi Konfigurasi

### 1. Test OPTIONS (Preflight)
```bash
curl -X OPTIONS https://apitny.uctech.online/api/auth/login \
  -H "Origin: https://tny.uctech.online" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

**Expected**: Status 200/204 dengan CORS headers

### 2. Test POST Request
```bash
curl -X POST https://apitny.uctech.online/api/auth/login \
  -H "Origin: https://tny.uctech.online" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected**: Status 200 dengan CORS headers, bukan 403

### 3. Cek Logs

**Nginx Proxy Manager logs**:
```bash
# Cek error log
sudo tail -f /data/logs/error.log
# atau
sudo tail -f /var/log/nginx/error.log
```

**Backend logs**:
```bash
docker logs hr-app -f
```

## ⚠️ Troubleshooting

### Masalah: Masih 403 Forbidden

1. **Cek apakah request sampai ke backend**:
   - Lihat logs backend (`docker logs hr-app`)
   - Jika tidak ada log request, berarti di-block di Nginx Proxy Manager

2. **Cek konfigurasi Nginx Proxy Manager**:
   - Pastikan "Block Common Exploits" OFF (untuk testing)
   - Pastikan "Websockets Support" ON
   - Pastikan custom config di tab "Advanced" sudah benar

3. **Cek Cloudflare**:
   - Pastikan proxy OFF (DNS only) - sudah benar ✅
   - Pastikan tidak ada firewall rules yang memblokir

### Masalah: CORS headers tidak muncul

1. **Pastikan Spring Boot sudah di-rebuild** dengan `CorsFilter.java`
2. **Pastikan custom config di Nginx Proxy Manager** sudah di-save
3. **Test langsung ke backend** (bypass Nginx Proxy Manager):
   ```bash
   curl -X POST http://localhost:8081/api/auth/login \
     -H "Origin: https://tny.uctech.online" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
     -v
   ```

### Masalah: Request timeout

1. **Cek proxy timeout settings** di Nginx Proxy Manager
2. **Tambah di custom config**:
   ```nginx
   proxy_connect_timeout 60s;
   proxy_send_timeout 60s;
   proxy_read_timeout 60s;
   ```

## 📝 Checklist

- [ ] Backend sudah di-rebuild dengan `CorsFilter.java`
- [ ] Backend container sudah di-restart
- [ ] Nginx Proxy Manager proxy host untuk `apitny.uctech.online` sudah dikonfigurasi
- [ ] Custom nginx config sudah ditambahkan di tab "Advanced"
- [ ] Cloudflare proxy OFF (DNS only) ✅
- [ ] Test OPTIONS request berhasil
- [ ] Test POST request berhasil
- [ ] CORS headers muncul di response

## 🎯 Expected Result

Setelah konfigurasi:
- ✅ OPTIONS request return 200/204 dengan CORS headers
- ✅ POST request ke `/api/auth/login` return 200 (bukan 403)
- ✅ Response headers ada `Access-Control-Allow-Origin: https://tny.uctech.online`
- ✅ Tidak ada error CORS di browser console
- ✅ Login berhasil dari frontend

## 🔗 Referensi

- Nginx Proxy Manager Docs: https://nginxproxymanager.com/
- Spring Boot CORS: https://spring.io/guides/gs/rest-service-cors/
