# 🚀 Setup Frontend & Backend Integration

## Cara Linking Frontend dengan Backend di Cursor

### 1. **Setup Backend (Java Spring Boot)**

Pastikan backend sudah berjalan:

```bash
# Di root project (/Users/user/Project/HR)
mvn spring-boot:run
```

Backend akan berjalan di: `http://localhost:8080`

### 2. **Setup Frontend (React + Vite)**

Buka terminal baru dan jalankan:

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies (hanya pertama kali)
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

### 3. **Konfigurasi CORS**

Backend sudah dikonfigurasi untuk allow CORS dari:
- `http://localhost:3000` (Vite default)
- `http://localhost:5173` (Vite alternate port)

Jika frontend berjalan di port lain, edit file:
`src/main/java/com/company/hr/security/SecurityConfig.java`

Tambahkan port baru di `corsConfigurationSource()`:
```java
configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "http://localhost:YOUR_PORT"));
```

### 4. **Environment Variables (Opsional)**

Buat file `.env` di folder `frontend`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_GENAI_API_KEY=your-api-key  # Opsional
```

### 5. **Testing Integration**

1. **Buka browser**: `http://localhost:3000`
2. **Login dengan credentials**:
   - Email: `admin@puskesmas.id`
   - Password: `admin123` (atau sesuai DDL)

3. **Cek Network Tab** di browser DevTools untuk melihat request ke backend

### 6. **Struktur File yang Sudah Terintegrasi**

```
HR/
├── src/                          # Backend Java
│   └── main/java/com/company/hr/
│       └── security/
│           └── SecurityConfig.java  # ✅ CORS sudah dikonfigurasi
│
└── frontend/                      # Frontend React
    ├── src/
    │   └── api/                   # ✅ API client sudah dibuat
    │       ├── client.ts          # Base API client
    │       ├── auth.ts            # Auth API
    │       ├── employee.ts       # Employee API
    │       ├── document.ts        # Document API
    │       ├── leave.ts          # Leave API
    │       ├── dashboard.ts       # Dashboard API
    │       └── settings.ts       # Settings API
    │
    ├── store.ts                   # ✅ Store sudah terintegrasi dengan API
    └── pages/
        └── LoginPage.tsx          # ✅ Login sudah menggunakan email
```

### 7. **API Endpoints yang Terintegrasi**

Semua endpoint sudah terintegrasi:

#### Authentication
- ✅ `POST /api/auth/login` - Login dengan email & password
- ✅ `POST /api/auth/logout` - Logout & blacklist token

#### Admin
- ✅ `GET /api/admin/dashboard` - Dashboard stats
- ✅ `GET /api/admin/employees` - List employees
- ✅ `POST /api/admin/employees` - Create employee
- ✅ `PUT /api/admin/employees/{id}` - Update employee
- ✅ `DELETE /api/admin/employees/{id}` - Delete employee
- ✅ `GET /api/admin/document-types` - List document types
- ✅ `POST /api/admin/document-types` - Create document type
- ✅ `PUT /api/admin/document-types/{id}` - Update document type
- ✅ `DELETE /api/admin/document-types/{id}` - Delete document type
- ✅ `GET /api/admin/documents/uploads` - List uploaded documents
- ✅ `GET /api/admin/leaves` - List all leave requests
- ✅ `POST /api/admin/leaves/{id}/approve` - Approve leave
- ✅ `POST /api/admin/leaves/{id}/reject` - Reject leave
- ✅ `GET /api/admin/settings` - Get settings
- ✅ `PUT /api/admin/settings` - Update settings
- ✅ `POST /api/admin/settings/logo` - Upload logo

#### Employee
- ✅ `GET /api/employee/dashboard` - Employee dashboard
- ✅ `GET /api/employee/profile` - Get profile
- ✅ `PUT /api/employee/profile` - Update profile
- ✅ `POST /api/employee/profile/password` - Change password
- ✅ `GET /api/employee/documents` - List documents
- ✅ `POST /api/employee/documents/{docTypeId}/upload` - Upload document
- ✅ `DELETE /api/employee/documents/{id}` - Delete document
- ✅ `GET /api/employee/leaves` - List own leaves
- ✅ `POST /api/employee/leaves` - Create leave request

### 8. **Troubleshooting**

#### Problem: CORS Error
**Solution**: Pastikan backend `SecurityConfig.java` sudah include port frontend Anda

#### Problem: 401 Unauthorized
**Solution**: 
- Pastikan token JWT masih valid
- Cek apakah token ada di `localStorage` sebagai `sikep_token`
- Login ulang jika token expired

#### Problem: API tidak terhubung
**Solution**:
- Pastikan backend berjalan di `http://localhost:8080`
- Cek `vite.config.ts` proxy configuration
- Cek browser console untuk error details

#### Problem: File upload tidak bekerja
**Solution**:
- Pastikan menggunakan `FormData` (sudah di-handle di `apiClient.postFormData`)
- Cek file size limit di backend
- Cek content-type yang diizinkan

### 9. **Development Workflow**

1. **Start Backend** (Terminal 1):
   ```bash
   mvn spring-boot:run
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Buka Browser**: `http://localhost:3000`

4. **Hot Reload**: 
   - Frontend: Auto reload saat edit file
   - Backend: Restart manual atau gunakan Spring DevTools

### 10. **Production Build**

**Frontend:**
```bash
cd frontend
npm run build
```
Output di `frontend/dist/` bisa di-deploy ke static hosting atau di-serve oleh Spring Boot.

**Backend:**
```bash
mvn clean package
java -jar target/hr-application.jar
```

---

## ✅ Checklist Integration

- [x] CORS configuration di backend
- [x] API client service di frontend
- [x] Authentication flow (login/logout)
- [x] Token management (JWT)
- [x] Error handling
- [x] Data mapping utilities
- [x] Store integration
- [x] Login page update (email instead of username)

Frontend dan backend sudah **fully integrated** dan siap digunakan! 🎉
