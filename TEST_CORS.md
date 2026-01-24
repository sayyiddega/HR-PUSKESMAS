# 🧪 Test CORS - Panduan Lengkap

## ✅ 301 Moved Permanently = Normal

Ketika curl ke `http://apitny.uctech.online`, mendapat **301 Moved Permanently** adalah **NORMAL**. 
Ini berarti server mengarahkan HTTP ke HTTPS (redirect).

## 🧪 Cara Test CORS yang Benar

### 1. Test Backend Langsung (Bypass Nginx Proxy Manager)

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected SETELAH rebuild**:
- ✅ Status 200 (bukan 403)
- ✅ Response JSON dengan `accessToken`
- ✅ CORS headers muncul
- ✅ Log: `CorsFilter: Allowing origin: https://tny.uctech.online`

### 2. Test Via Domain (HTTPS)

```bash
curl -X POST https://apitny.uctech.online/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected SETELAH rebuild**:
- ✅ Status 200 (bukan 403)
- ✅ Response JSON dengan `accessToken`
- ✅ CORS headers muncul
- ✅ `access-control-allow-origin: https://tny.uctech.online`

### 3. Test OPTIONS Preflight

```bash
curl -X OPTIONS https://apitny.uctech.online/api/auth/login \
  -H "Origin: https://tny.uctech.online" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

**Expected**:
- ✅ Status 200/204
- ✅ CORS headers muncul
- ✅ `access-control-allow-origin: https://tny.uctech.online`

## 🔍 Verifikasi Setelah Rebuild

### 1. Cek Logs Backend

```bash
docker logs hr-app -f
```

**Cari log ini**:
```
CorsFilter: POST /api/auth/login | Origin: https://tny.uctech.online
CorsFilter: Allowing origin: https://tny.uctech.online
```

**Jika TIDAK ada log ini**:
- ❌ Backend belum di-rebuild dengan benar
- ❌ CorsFilter tidak berjalan
- ❌ Perlu rebuild ulang

### 2. Cek Response Headers

**Headers yang HARUS ada** (setelah rebuild):
- ✅ `access-control-allow-origin: https://tny.uctech.online`
- ✅ `access-control-allow-credentials: true`
- ✅ `access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- ✅ `access-control-allow-headers: *`

**Headers yang TIDAK boleh ada** (setelah rebuild):
- ❌ `Vary: Origin` (ini dari Spring Security CORS yang sudah di-disable)

### 3. Test dari Browser

1. Buka: `https://tny.uctech.online`
2. Buka Developer Tools → Network tab
3. Coba login
4. Cek request ke `https://apitny.uctech.online/api/auth/login`
5. Pastikan:
   - Status: 200 (bukan 403)
   - Response headers ada CORS headers
   - Tidak ada error CORS di console

## ⚠️ Troubleshooting

### Masalah: Masih 403 "Invalid CORS request"

**Penyebab**: Backend belum di-rebuild

**Solusi**:
1. Pastikan JAR di-rebuild: `mvn clean package -DskipTests`
2. Pastikan Docker image di-build: `docker build -t hr-backend:latest -f dockerfile .`
3. Pastikan container di-restart: `docker stop hr-app && docker rm hr-app && docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest`
4. Cek logs: `docker logs hr-app -f` - harus ada log CorsFilter

### Masalah: Tidak ada log CorsFilter

**Penyebab**: CorsFilter tidak berjalan

**Solusi**:
1. Pastikan rebuild JAR benar-benar selesai
2. Pastikan tidak ada error saat build
3. Cek apakah CorsFilter ter-register: cari di logs saat startup

### Masalah: Masih ada `Vary: Origin`

**Penyebab**: Spring Security CORS masih aktif

**Solusi**:
1. Pastikan `.cors(cors -> cors.disable())` di SecurityConfig
2. Rebuild backend
3. Restart container

## ✅ Checklist

- [ ] Backend sudah di-rebuild (mvn clean package)
- [ ] Docker image sudah di-build baru
- [ ] Container sudah di-restart
- [ ] Test curl ke localhost:8081 return 200
- [ ] Log CorsFilter muncul di logs
- [ ] Test curl ke https://apitny.uctech.online return 200
- [ ] CORS headers muncul di response
- [ ] Tidak ada `Vary: Origin` di response
- [ ] Test dari browser berhasil

## 🎯 Expected Final Result

Setelah semua perbaikan:
- ✅ Request ke backend return 200
- ✅ CORS headers muncul
- ✅ Login berhasil dari frontend
- ✅ Tidak ada error CORS di browser console
- ✅ Tidak ada "Invalid CORS request"
