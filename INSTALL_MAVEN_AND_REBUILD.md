# ⚠️ CRITICAL: Install Maven & Rebuild JAR

## 🔴 Masalah
- **Maven tidak ditemukan** → JAR tidak bisa di-rebuild
- **JAR file lama** (Jan 20 12:22) → sebelum perubahan CORS
- **Docker build menggunakan JAR lama** → masih 403 "Invalid CORS request"

## ✅ Solusi: Install Maven & Rebuild

### Opsi 1: Install Maven (Recommended)

```bash
# Install Maven
sudo apt update
sudo apt install maven -y

# Verifikasi
mvn --version

# Rebuild JAR
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan
mvn clean package -DskipTests

# Rebuild Docker image
docker build -t hr-backend:latest -f dockerfile .

# Restart container
docker stop hr-app && docker rm hr-app
docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
```

### Opsi 2: Rebuild di Mesin Lain (Jika Tidak Bisa Install Maven)

Jika tidak bisa install Maven di server ini:

1. **Copy source code** ke mesin yang punya Maven
2. **Rebuild JAR** di sana:
   ```bash
   mvn clean package -DskipTests
   ```
3. **Copy JAR baru** ke server:
   ```bash
   scp target/hr-0.0.1-SNAPSHOT.jar user@server:/media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan/target/
   ```
4. **Rebuild Docker image** di server:
   ```bash
   docker build -t hr-backend:latest -f dockerfile .
   docker stop hr-app && docker rm hr-app
   docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
   ```

### Opsi 3: Gunakan Docker untuk Build (Jika Ada)

Jika ada Docker dengan Maven:

```bash
# Build JAR menggunakan Docker Maven
docker run --rm \
  -v /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan:/app \
  -w /app \
  maven:3.8-openjdk-17 \
  mvn clean package -DskipTests

# Setelah JAR di-build, build Docker image
docker build -t hr-backend:latest -f dockerfile .

# Restart container
docker stop hr-app && docker rm hr-app
docker run -d -p 8081:8080 --name hr-app --restart unless-stopped hr-backend:latest
```

## 🔍 Verifikasi Setelah Rebuild

### 1. Cek JAR File Timestamp

```bash
ls -lh target/hr-0.0.1-SNAPSHOT.jar
```

**Expected**: Timestamp HARUS baru (setelah rebuild), bukan Jan 20 12:22

### 2. Test Backend Langsung

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tny.uctech.online" \
  -d '{"email":"admin@puskesmas.id","password":"admin123"}' \
  -v
```

**Expected**: Status 200 (bukan 403)

### 3. Cek Logs

```bash
docker logs hr-app -f
```

**Cari log**:
```
CorsFilter: POST /api/auth/login | Origin: https://tny.uctech.online
CorsFilter: Allowing origin: https://tny.uctech.online
```

## ⚠️ Catatan Penting

- **JAR HARUS di-rebuild** - perubahan code tidak akan ter-apply tanpa rebuild
- **JAR lama = code lama** - masih menggunakan Spring Security CORS (403 error)
- **JAR baru = code baru** - menggunakan custom CorsFilter (200 OK)

## 🎯 Expected Result

Setelah rebuild JAR yang benar:
- ✅ JAR file timestamp baru
- ✅ Test curl return 200 (bukan 403)
- ✅ Log CorsFilter muncul
- ✅ Tidak ada `Vary: Origin` di response
- ✅ CORS headers muncul
