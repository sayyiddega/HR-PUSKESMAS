-- ============================================
-- Delta: Extended ASN/PNS fields for employees
-- Jalankan setelah ddl.sql (atau jika tabel employees sudah ada)
-- Schema: hr_puskesmas | Database: PostgreSQL
-- ============================================

SET search_path TO hr_puskesmas;

ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS tmt_pangkat_gol_ruang VARCHAR(50);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS tmt_jabatan DATE;
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS tmt_cpns DATE;
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS tmt_pns DATE;
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS masa_kerja VARCHAR(50);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS nama_latihan_jabatan VARCHAR(200);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS tanggal_latihan_jabatan DATE;
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS lama_jam VARCHAR(30);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS nama_fakultas_pendidikan_terakhir VARCHAR(200);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS jurusan_pendidikan_terakhir VARCHAR(200);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS tahun_lulus_pendidikan INTEGER;
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS catatan_mutasi VARCHAR(2000);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS karpeg VARCHAR(100);
ALTER TABLE hr_puskesmas.employees ADD COLUMN IF NOT EXISTS keterangan VARCHAR(2000);

COMMENT ON COLUMN hr_puskesmas.employees.tmt_pangkat_gol_ruang IS 'TMT Pangkat/Gol/Ruang (ASN)';
COMMENT ON COLUMN hr_puskesmas.employees.tmt_jabatan IS 'TMT Jabatan';
COMMENT ON COLUMN hr_puskesmas.employees.tmt_cpns IS 'TMT CPNS';
COMMENT ON COLUMN hr_puskesmas.employees.tmt_pns IS 'TMT PNS';
COMMENT ON COLUMN hr_puskesmas.employees.masa_kerja IS 'Masa kerja';
COMMENT ON COLUMN hr_puskesmas.employees.nama_latihan_jabatan IS 'Nama latihan jabatan';
COMMENT ON COLUMN hr_puskesmas.employees.tanggal_latihan_jabatan IS 'Tanggal latihan jabatan';
COMMENT ON COLUMN hr_puskesmas.employees.lama_jam IS 'Lama (jam)';
COMMENT ON COLUMN hr_puskesmas.employees.nama_fakultas_pendidikan_terakhir IS 'Nama fakultas pendidikan terakhir';
COMMENT ON COLUMN hr_puskesmas.employees.jurusan_pendidikan_terakhir IS 'Jurusan pendidikan terakhir';
COMMENT ON COLUMN hr_puskesmas.employees.tahun_lulus_pendidikan IS 'Tahun lulus pendidikan';
COMMENT ON COLUMN hr_puskesmas.employees.catatan_mutasi IS 'Catatan mutasi';
COMMENT ON COLUMN hr_puskesmas.employees.karpeg IS 'Kartu Pegawai';
COMMENT ON COLUMN hr_puskesmas.employees.keterangan IS 'Keterangan umum';
