# 🔧 Final Fix: Disable Spring Security CORS

## 🔴 Masalah
Masih 403 "Invalid CORS request" meskipun sudah rebuild. Error ini berasal dari **Spring Security CORS filter**, bukan dari custom CorsFilter.

## ✅ Solusi: Disable Spring Security CORS

Spring Security CORS filter conflict dengan custom CorsFilter. Solusinya: **disable Spring Security CORS** dan hanya pakai custom CorsFilter.

### Perubahan di SecurityConfig.java

```java
// SEBELUM (masalah):
.cors(cors -> cors.configurationSource(corsConfigurationSource()))

// SESUDAH (fix):
.cors(cors -> cors.disable())
```

## 📋 Langkah-langkah

### 1. Rebuild Backend

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

### 2. Test Backend Langsung

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected**: Status 200 dengan response JSON, bukan 403

### 3. Test Via Domain

```bash
curl -X POST https://apitny.uctech.online/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected**: Status 200 dengan CORS headers

## 🔍 Kenapa Perlu Disable Spring Security CORS?

1. **Spring Security CORS** menggunakan `CorsConfigurationSource` yang strict
2. **Custom CorsFilter** lebih fleksibel dan sudah di-handle dengan benar
3. **Konflik** antara keduanya menyebabkan "Invalid CORS request"
4. **Solusi**: Hanya pakai custom CorsFilter, disable Spring Security CORS

## ✅ Yang Sudah Diperbaiki

1. ✅ **SecurityConfig.java** - Disable Spring Security CORS (`.cors(cors -> cors.disable())`)
2. ✅ **CorsFilter.java** - Sudah handle CORS dengan benar
3. ✅ Custom CorsFilter dijalankan **sebelum** Spring Security filter

## 🎯 Expected Result

Setelah rebuild:
- ✅ Request ke `http://localhost:8081/api/auth/login` return 200
- ✅ Request ke `https://apitny.uctech.online/api/auth/login` return 200
- ✅ CORS headers muncul di response
- ✅ Login berhasil dari frontend
- ✅ Tidak ada error "Invalid CORS request"

## 📝 Catatan

- Custom CorsFilter sudah cukup untuk handle CORS
- Spring Security CORS tidak diperlukan lagi
- CorsConfigurationSource masih ada di code (tidak digunakan), bisa dihapus nanti jika mau
