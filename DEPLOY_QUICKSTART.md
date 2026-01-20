# Quick Start Deployment

## Persiapan

1. **Buat file `.env` dari template:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` dengan konfigurasi server Anda:**
   ```bash
   nano .env
   ```
   
   **WAJIB diubah:**
   - `DB_PASSWORD` - Password database yang kuat
   - `JWT_SECRET` - Secret key minimal 32 karakter (WAJIB diganti!)

## Deploy via SSH

### Opsi 1: Menggunakan Script (Paling Mudah)

```bash
chmod +x deploy.sh
./deploy.sh user@your-server.com /opt/hr-system
```

Contoh:
```bash
./deploy.sh root@192.168.1.100 /opt/hr-system
```

### Opsi 2: Manual

1. **Copy project ke server:**
   ```bash
   rsync -avz --exclude='node_modules' --exclude='target' \
     ./ user@server:/opt/hr-system/
   ```

2. **SSH ke server:**
   ```bash
   ssh user@server
   cd /opt/hr-system
   ```

3. **Setup environment:**
   ```bash
   cp env.example .env
   nano .env  # Edit sesuai kebutuhan
   ```

4. **Deploy:**
   ```bash
   docker compose up -d --build
   ```

## Verifikasi

```bash
# Check status
docker compose ps

# Check logs
docker compose logs -f

# Test API
curl http://localhost:8080/api/auth/health
```

## Management

```bash
# Restart
docker compose restart

# Stop
docker compose stop

# Start
docker compose start

# Update (setelah git pull)
docker compose up -d --build
```

## Troubleshooting

- **Container tidak start:** `docker compose logs`
- **Port conflict:** Ubah port di `.env`
- **Database error:** Check `docker compose logs postgres`

Lihat `DEPLOYMENT.md` untuk panduan lengkap.
