# Fix 404: Logo & Gambar (/files/*) Tidak Bisa Dibuka

## Penyebab
1. **Uploads tidak persisten** — Folder `uploads` (logo, foto profil, dokumen) ada di dalam container. Setiap rebuild/restart container = folder baru = file hilang → 404.
2. **Proxy tidak forward /files** — Nginx Proxy Manager harus meneruskan `https://apitny.uctech.online/files/*` ke backend (port 8081).

## Solusi

### 1. Volume Docker untuk uploads (sudah diterapkan)
Backend sekarang dijalankan dengan volume `hr-uploads`:
```bash
docker run -d -p 8081:8080 -v hr-uploads:/app/uploads --name hr-backend ... hr-backend:latest
```
- File yang di-upload **akan tetap ada** setelah rebuild/restart.
- Volume `hr-uploads` dipakai bersama container backend.

### 2. Nginx Proxy Manager: forward /files ke backend
Pastikan proxy host `apitny.uctech.online` meneruskan **semua path** ke backend (bukan hanya `/api`):
- **Forward**: `http://127.0.0.1:8081` (atau IP container).
- **Jangan** batasi ke `location /api` saja — request ke `/files/profile-photos/...`, `/files/logos/...` juga harus ke backend.

### 3. Master Style: Website Base URL
Di **Master Style**, isi **Website Base URL** dengan:
```text
https://apitny.uctech.online
```
(tanpa slash di akhir, tanpa `/api`). URL file akan berbentuk `https://apitny.uctech.online/files/...`.

### 4. Setelah volume pertama kali dipakai
- Volume baru `hr-uploads` awalnya **kosong**.
- **Logo** dan **foto profil** yang dulu ada sudah hilang (container lama tanpa volume).
- **Upload ulang** logo di Master Style dan foto profil di Profile / Master Karyawan. Setelah itu, file akan tersimpan di volume dan tidak hilang saat rebuild/restart.

## Cek cepat
```bash
# Cek volume
docker volume ls | grep hr-uploads

# Cek file di dalam volume (via container)
docker run --rm -v hr-uploads:/data alpine ls -la /data
```
