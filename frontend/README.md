# SIKEP Puskesmas - Frontend

Frontend aplikasi Sistem Informasi Kepegawaian Puskesmas yang terintegrasi dengan Backend Java Spring Boot.

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ dan npm/yarn
- Backend Java Spring Boot berjalan di `http://localhost:8080`

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Setup environment variable (opsional):**
Buat file `.env` di folder `frontend`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_GENAI_API_KEY=your-google-genai-api-key  # Opsional, untuk fitur AI notification
```

3. **Jalankan development server:**
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
frontend/
├── src/
│   ├── api/              # API client services
│   │   ├── client.ts     # Base API client
│   │   ├── auth.ts       # Authentication API
│   │   ├── employee.ts   # Employee API
│   │   ├── document.ts   # Document API
│   │   ├── leave.ts      # Leave request API
│   │   ├── dashboard.ts  # Dashboard API
│   │   └── settings.ts   # Settings API
│   └── utils/
│       └── mappers.ts    # Data mapping utilities
├── pages/                # React pages/components
├── components/           # Reusable components
├── store.ts              # Main store dengan API integration
├── types.ts              # TypeScript type definitions
└── constants.tsx         # Constants & icons
```

## 🔗 Integrasi dengan Backend

Frontend ini sudah terintegrasi penuh dengan backend Java Spring Boot:

### Authentication
- **Login**: `POST /api/auth/login` dengan `{email, password}`
- **Logout**: `POST /api/auth/logout`
- Token JWT disimpan di `localStorage` sebagai `sikep_token`

### API Endpoints yang Digunakan

#### Admin Endpoints:
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/employees` - List all employees
- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/{id}` - Update employee
- `DELETE /api/admin/employees/{id}` - Delete employee
- `GET /api/admin/document-types` - List document types
- `POST /api/admin/document-types` - Create document type
- `PUT /api/admin/document-types/{id}` - Update document type
- `DELETE /api/admin/document-types/{id}` - Delete document type
- `GET /api/admin/documents/uploads` - List uploaded documents (grouped)
- `GET /api/admin/leaves` - List all leave requests
- `POST /api/admin/leaves/{id}/approve` - Approve leave
- `POST /api/admin/leaves/{id}/reject` - Reject leave
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings
- `POST /api/admin/settings/logo` - Upload logo

#### Employee Endpoints:
- `GET /api/employee/dashboard` - Employee dashboard
- `GET /api/employee/profile` - Get own profile
- `PUT /api/employee/profile` - Update own profile
- `POST /api/employee/profile/password` - Change password
- `GET /api/employee/documents` - List own documents
- `POST /api/employee/documents/{docTypeId}/upload` - Upload document
- `DELETE /api/employee/documents/{id}` - Delete document
- `GET /api/employee/leaves` - List own leave requests
- `POST /api/employee/leaves` - Create leave request

## 🔧 Configuration

### Vite Configuration
File `vite.config.ts` sudah dikonfigurasi dengan proxy untuk development:
- `/api/*` → `http://localhost:8080/api/*`
- `/files/*` → `http://localhost:8080/files/*`

### API Client
Base API client (`src/api/client.ts`) otomatis:
- Menambahkan JWT token ke header Authorization
- Handle 401 Unauthorized (auto logout)
- Parse response format `{data: ...}` dari backend

## 🧪 Testing

### Default Login Credentials (dari DDL):
- **Admin**: 
  - Email: `admin@puskesmas.id`
  - Password: `admin123` (atau sesuai yang di-set di database)

### Mock Data Fallback
Jika backend tidak tersedia, aplikasi akan fallback ke mock data di `localStorage` untuk development/testing.

## 📝 Notes

1. **CORS**: Pastikan backend Spring Boot sudah dikonfigurasi untuk allow CORS dari `http://localhost:3000`
2. **File Upload**: File upload menggunakan `FormData` dan dikirim ke endpoint yang sesuai
3. **Error Handling**: Semua error dari API akan ditampilkan sebagai notification toast
4. **Token Management**: JWT token disimpan di localStorage dan otomatis ditambahkan ke setiap request

## 🛠️ Build untuk Production

```bash
npm run build
```

Output akan di folder `dist/` yang bisa di-deploy ke static hosting atau di-serve oleh backend Spring Boot.

## 🔄 Linking dengan Cursor

Frontend ini sudah terintegrasi dengan backend di folder yang sama. Untuk development:

1. **Jalankan Backend:**
```bash
# Di root project
mvn spring-boot:run
```

2. **Jalankan Frontend:**
```bash
# Di folder frontend
npm run dev
```

3. **Akses:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html

Frontend dan backend akan otomatis terhubung melalui proxy di Vite config.
