-- ============================================
-- HR Puskesmas Database DDL
-- Schema: hr_puskesmas
-- Database: PostgreSQL
-- Version: 2.0 (Updated)
-- ============================================

-- Buat schema jika belum ada
CREATE SCHEMA IF NOT EXISTS hr_puskesmas;

-- Set search path ke schema
SET search_path TO hr_puskesmas;

-- ============================================
-- 1. Tabel User Accounts (Login & Role)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_puskesmas.user_accounts (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_user_accounts_email UNIQUE (email),
    CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'EMPLOYEE'))
);

CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON hr_puskesmas.user_accounts(email);

-- ============================================
-- 2. Tabel Employees (Profil Pegawai)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_puskesmas.employees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES hr_puskesmas.user_accounts(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    position VARCHAR(120),
    department VARCHAR(120),
    phone VARCHAR(50),
    address VARCHAR(255),
    date_of_birth DATE,
    join_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON hr_puskesmas.employees(user_id);

-- Add profile_photo_path column to employees table (delta update)
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS profile_photo_path VARCHAR(500);

-- ============================================
-- Internal Messages Table (delta update)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_puskesmas.internal_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES hr_puskesmas.employees(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES hr_puskesmas.employees(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    reply_to_id BIGINT REFERENCES hr_puskesmas.internal_messages(id) ON DELETE SET NULL,
    thread_id BIGINT,
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(120),
    attachment_size BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_messages_receiver ON hr_puskesmas.internal_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender ON hr_puskesmas.internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON hr_puskesmas.internal_messages(created_at DESC);

-- Threading support (delta update)
ALTER TABLE hr_puskesmas.internal_messages ADD COLUMN IF NOT EXISTS thread_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_internal_messages_thread_id ON hr_puskesmas.internal_messages(thread_id);

-- Backfill existing rows (optional)
UPDATE hr_puskesmas.internal_messages
SET thread_id = id
WHERE thread_id IS NULL;

-- ============================================
-- 3. Tabel Document Types (Master Dokumen)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_puskesmas.document_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description VARCHAR(500),
    mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_document_types_name UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_document_types_mandatory ON hr_puskesmas.document_types(mandatory);

-- ============================================
-- 4. Tabel Employee Documents (Dokumen Pegawai)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_puskesmas.employee_documents (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES hr_puskesmas.employees(id) ON DELETE CASCADE,
    document_type_id BIGINT NOT NULL REFERENCES hr_puskesmas.document_types(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    stored_path TEXT NOT NULL,
    content_type VARCHAR(200) NOT NULL,
    size BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emp_docs_emp ON hr_puskesmas.employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_docs_type ON hr_puskesmas.employee_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_emp_docs_emp_type ON hr_puskesmas.employee_documents(employee_id, document_type_id);

-- ============================================
-- 5. Tabel Leave Requests (Pengajuan Cuti)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_puskesmas.leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES hr_puskesmas.employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    attachment_path TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_emp ON hr_puskesmas.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON hr_puskesmas.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON hr_puskesmas.leave_requests(start_date, end_date);

-- ============================================
-- 6. Tabel App Settings (Master Setting)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_puskesmas.app_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(200),
    address VARCHAR(255),
    phone VARCHAR(50),
    website_base_url VARCHAR(300),
    logo_path VARCHAR(500),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_single_setting CHECK (id = 1)
);

-- ============================================
-- INSERT: Administrator Default
-- ============================================
-- Password: admin123
-- BCrypt Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- 
-- Untuk generate hash baru, bisa pakai:
-- - Online: https://bcrypt-generator.com/
-- - Java: BCrypt.hashpw("password", BCrypt.gensalt())
-- - Atau lewat endpoint register/login dulu, lalu update role jadi ADMIN
-- ============================================
INSERT INTO hr_puskesmas.user_accounts (email, password_hash, role)
VALUES ('admin@puskesmas.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- INSERT: App Settings Default
-- ============================================
INSERT INTO hr_puskesmas.app_settings (id, site_name, address, phone, website_base_url)
VALUES (1, 'HR Puskesmas', NULL, NULL, 'http://localhost:8080')
ON CONFLICT (id) DO UPDATE 
SET site_name = EXCLUDED.site_name,
    website_base_url = EXCLUDED.website_base_url;

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

COMMENT ON SCHEMA hr_puskesmas IS 'Schema untuk aplikasi HR Puskesmas';
COMMENT ON TABLE hr_puskesmas.user_accounts IS 'Tabel untuk akun login dan role user';
COMMENT ON TABLE hr_puskesmas.employees IS 'Tabel untuk profil pegawai';
COMMENT ON TABLE hr_puskesmas.document_types IS 'Tabel master jenis dokumen';
COMMENT ON TABLE hr_puskesmas.employee_documents IS 'Tabel dokumen yang di-upload oleh pegawai';
COMMENT ON TABLE hr_puskesmas.leave_requests IS 'Tabel pengajuan cuti pegawai';
COMMENT ON TABLE hr_puskesmas.app_settings IS 'Tabel pengaturan aplikasi (singleton)';

COMMENT ON COLUMN hr_puskesmas.user_accounts.role IS 'Role user: ADMIN atau EMPLOYEE';
COMMENT ON COLUMN hr_puskesmas.employees.user_id IS 'Foreign key ke user_accounts (one-to-one)';
COMMENT ON COLUMN hr_puskesmas.document_types.mandatory IS 'Apakah dokumen wajib di-upload';
COMMENT ON COLUMN hr_puskesmas.leave_requests.status IS 'Status pengajuan: PENDING, APPROVED, atau REJECTED';
COMMENT ON COLUMN hr_puskesmas.app_settings.id IS 'Selalu 1 (singleton pattern)';

-- ============================================
-- CATATAN PENTING
-- ============================================
-- 1. Password default admin: admin123
-- 2. Semua ID menggunakan BIGSERIAL (BIGINT) untuk kompatibilitas dengan JPA
-- 3. Timestamp menggunakan TIMESTAMP (tanpa timezone) sesuai dengan Java Instant
-- 4. Foreign keys menggunakan ON DELETE CASCADE untuk data integrity
-- 5. Constraints untuk validasi data (role, status, dates)
-- 6. Index untuk performa query
-- 7. Website Base URL bisa di-update via API: PUT /api/admin/settings
-- 8. Logo bisa di-upload via API: POST /api/admin/settings/logo
-- 9. Untuk production, pastikan:
--    - Ganti password admin default
--    - Set website_base_url sesuai domain production
--    - Backup database secara berkala
-- ============================================
