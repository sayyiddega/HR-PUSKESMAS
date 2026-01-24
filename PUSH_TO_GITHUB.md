# 🚀 Push ke GitHub - Instruksi

## ✅ Status
- ✅ Git repository sudah di-setup
- ✅ Remote origin sudah dikonfigurasi: `https://github.com/sayyiddega/HR-PUSKESMAS.git`
- ✅ Semua file sudah di-commit (148 files)
- ⏳ Perlu push ke GitHub (butuh authentication)

## 📋 Cara Push ke GitHub

### Opsi 1: Push dengan Personal Access Token (Recommended)

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

# Push dengan token (ganti YOUR_TOKEN dengan token GitHub Anda)
git push https://YOUR_TOKEN@github.com/sayyiddega/HR-PUSKESMAS.git main
```

**Cara membuat Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Pilih scope: `repo` (full control of private repositories)
4. Copy token
5. Gunakan token sebagai password saat push

### Opsi 2: Push dengan Username/Password

```bash
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan

# Push (akan diminta username dan password)
git push origin main
```

**Note**: GitHub tidak lagi menerima password biasa. Perlu menggunakan Personal Access Token.

### Opsi 3: Setup SSH Key (Untuk Future)

```bash
# Generate SSH key (jika belum ada)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add ke GitHub: Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
cd /media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan
git remote set-url origin git@github.com:sayyiddega/HR-PUSKESMAS.git

# Push
git push origin main
```

### Opsi 4: Push Manual via GitHub Desktop atau Web

1. Buka GitHub Desktop atau web interface
2. Clone repository: `https://github.com/sayyiddega/HR-PUSKESMAS.git`
3. Copy semua file dari `/media/devmon/IR5_CCSA_X64FRE_EN-U/website/tenayan`
4. Commit dan push

## 📝 File yang Sudah Di-Commit

Commit message:
```
Fix CORS between frontend and backend

- Add custom CorsFilter with highest priority
- Disable Spring Security CORS, use custom filter instead
- Update SecurityConfig to register CorsFilter via FilterRegistrationBean
- Update JwtAuthFilter to skip /api/auth/** endpoints
- Add comprehensive CORS documentation
- Fix nginx configuration for frontend
- Update dockerfile to use nginx.conf

CORS now working: Status 401 (auth) instead of 403 (CORS error)
Frontend: tny.uctech.online
Backend: apitny.uctech.online
```

**148 files changed, 16759 insertions(+)**

## ✅ Checklist

- [x] Git repository initialized
- [x] Remote origin configured
- [x] .gitignore created
- [x] All files added
- [x] Commit created
- [ ] Push to GitHub (butuh authentication)

## 🔐 Authentication

GitHub memerlukan authentication untuk push. Pilih salah satu:
1. **Personal Access Token** (paling mudah)
2. **SSH Key** (untuk future)
3. **GitHub CLI** (`gh auth login`)

Setelah authentication setup, jalankan:
```bash
git push origin main
```
