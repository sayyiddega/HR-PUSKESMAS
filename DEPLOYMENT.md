# Deployment Guide - HR System

Panduan deployment aplikasi HR System menggunakan Docker dan Docker Compose.

## Prerequisites

1. **Server dengan SSH access**
2. **Docker** dan **Docker Compose** terinstall di server
3. **Git** (opsional, untuk clone repository)

## Konfigurasi

### 1. Buat file `.env`

Copy file `.env.example` menjadi `.env` dan edit sesuai kebutuhan:

```bash
cp .env.example .env
nano .env
```

**Konfigurasi penting:**

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# JWT Secret (WAJIB diganti di production!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=80

# Production URLs (untuk CORS)
FRONTEND_URL=https://tny.uctech.online
BACKEND_URL=https://apitny.uctech.online
```

### 2. Update CORS di Backend

Jika menggunakan domain production, pastikan CORS sudah dikonfigurasi di:
- `src/main/java/com/company/hr/security/SecurityConfig.java`
- `src/main/java/com/company/hr/security/CorsFilter.java`

## Deployment Methods

### Method 1: Menggunakan Script Deploy (Recommended)

1. **Buat script executable:**
   ```bash
   chmod +x deploy.sh
   ```

2. **Jalankan deployment:**
   ```bash
   ./deploy.sh user@your-server.com /opt/hr-system
   ```

   Contoh:
   ```bash
   ./deploy.sh root@192.168.1.100 /opt/hr-system
   ```

Script akan:
- Test koneksi SSH
- Copy semua file ke server
- Install Docker jika belum ada
- Build dan start containers

### Method 2: Manual Deployment via SSH

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

3. **Buat file `.env`:**
   ```bash
   cp .env.example .env
   nano .env  # Edit sesuai kebutuhan
   ```

4. **Build dan start containers:**
   ```bash
   docker compose up -d --build
   ```

### Method 3: Git Clone di Server

1. **SSH ke server dan clone repository:**
   ```bash
   ssh user@server
   cd /opt
   git clone your-repo-url hr-system
   cd hr-system
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Deploy:**
   ```bash
   docker compose up -d --build
   ```

## Verifikasi Deployment

### 1. Check Container Status

```bash
docker compose ps
```

Semua container harus dalam status `Up` dan `healthy`.

### 2. Check Logs

```bash
# Semua logs
docker compose logs -f

# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Database logs
docker compose logs -f postgres
```

### 3. Test API

```bash
# Health check (jika ada endpoint)
curl http://localhost:8080/api/auth/health

# Test frontend
curl http://localhost
```

### 4. Check Database

```bash
docker compose exec postgres psql -U postgres -d postgres -c "\dt hr_puskesmas.*"
```

## Management Commands

### Restart Services

```bash
# Restart semua
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

### Stop Services

```bash
docker compose stop
```

### Start Services

```bash
docker compose start
```

### Update Deployment

```bash
# Pull latest code (jika menggunakan git)
git pull

# Rebuild dan restart
docker compose up -d --build
```

### View Logs

```bash
# Real-time logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Access Container Shell

```bash
# Backend
docker compose exec backend sh

# Database
docker compose exec postgres psql -U postgres -d postgres
```

## Production Considerations

### 1. Reverse Proxy (Nginx/OpenResty)

Jika menggunakan reverse proxy, pastikan konfigurasi CORS sudah benar. Contoh konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name apitny.uctech.online;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
            add_header 'Access-Control-Allow-Headers' '*' always;
            add_header 'Access-Control-Max-Age' '3600';
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### 2. SSL/TLS

Gunakan Let's Encrypt untuk SSL:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d tny.uctech.online -d apitny.uctech.online
```

### 3. Database Backup

Setup automated backup:

```bash
# Backup script
docker compose exec postgres pg_dump -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker compose exec -T postgres psql -U postgres postgres < backup.sql
```

### 4. Monitoring

Pertimbangkan untuk menggunakan monitoring tools seperti:
- Prometheus + Grafana
- Docker stats
- Application logs

### 5. Security

- **Ganti JWT secret** di production
- **Ganti password database** yang kuat
- **Enable firewall** (UFW/iptables)
- **Update Docker images** secara berkala
- **Limit SSH access** dengan key-based authentication

## Troubleshooting

### Container tidak start

```bash
# Check logs
docker compose logs

# Check resource usage
docker stats

# Check disk space
df -h
```

### Database connection error

```bash
# Check database status
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U postgres -d postgres
```

### CORS errors

1. Check CORS configuration di `SecurityConfig.java`
2. Check reverse proxy configuration
3. Check browser console untuk detail error
4. Verify `allowedOrigins` sesuai dengan domain frontend

### Port already in use

```bash
# Check port usage
sudo lsof -i :8080
sudo lsof -i :80

# Change port di .env atau docker-compose.yml
```

## Rollback

Jika ada masalah, rollback ke versi sebelumnya:

```bash
# Stop containers
docker compose down

# Checkout previous version (jika menggunakan git)
git checkout <previous-commit>

# Rebuild
docker compose up -d --build
```

## Support

Jika ada masalah, check:
1. Logs: `docker compose logs -f`
2. Container status: `docker compose ps`
3. Network: `docker network ls`
4. Volumes: `docker volume ls`
