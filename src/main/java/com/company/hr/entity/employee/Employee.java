package com.company.hr.entity.employee;

import com.company.hr.entity.auth.UserAccount;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private UserAccount userAccount;

    @Column(nullable = false, length = 200)
    private String fullName;

    @Column(length = 120)
    private String position;

    @Column(length = 120)
    private String department;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String address;

    // Enriched biodata fields (ASN-style)
    @Column(name = "nip", length = 30)
    private String nip;

    @Column(name = "nik", length = 30)
    private String nik;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "place_of_birth", length = 100)
    private String placeOfBirth;

    @Column(name = "marital_status", length = 30)
    private String maritalStatus;

    @Column(name = "religion", length = 30)
    private String religion;

    @Column(name = "last_education", length = 100)
    private String lastEducation;

    @Column(name = "rank_golongan", length = 30)
    private String rankGolongan;

    @Column(name = "employment_status", length = 30)
    private String employmentStatus;

    @Column(name = "remaining_leave_days")
    private Integer remainingLeaveDays;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "join_date")
    private LocalDate joinDate;

    // Extended ASN/PNS fields
    @Column(name = "tmt_pangkat_gol_ruang", length = 50)
    private String tmtPangkatGolRuang;

    @Column(name = "tmt_jabatan")
    private LocalDate tmtJabatan;

    @Column(name = "tmt_cpns")
    private LocalDate tmtCpns;

    @Column(name = "tmt_pns")
    private LocalDate tmtPns;

    @Column(name = "masa_kerja", length = 50)
    private String masaKerja;

    @Column(name = "nama_latihan_jabatan", length = 200)
    private String namaLatihanJabatan;

    @Column(name = "tanggal_latihan_jabatan")
    private LocalDate tanggalLatihanJabatan;

    @Column(name = "lama_jam", length = 30)
    private String lamaJam;

    @Column(name = "nama_fakultas_pendidikan_terakhir", length = 200)
    private String namaFakultasPendidikanTerakhir;

    @Column(name = "jurusan_pendidikan_terakhir", length = 200)
    private String jurusanPendidikanTerakhir;

    @Column(name = "tahun_lulus_pendidikan")
    private Integer tahunLulusPendidikan;

    @Column(name = "catatan_mutasi", length = 2000)
    private String catatanMutasi;

    @Column(name = "karpeg", length = 100)
    private String karpeg;

    @Column(name = "keterangan", length = 2000)
    private String keterangan;

    @Column(length = 500)
    private String profilePhotoPath;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    protected Employee() {
    }

    public Employee(UserAccount userAccount, String fullName, String position, String department) {
        this.userAccount = userAccount;
        this.fullName = fullName;
        this.position = position;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUserAccount() {
        return userAccount;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPosition() {
        return position;
    }

    public String getDepartment() {
        return department;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getNip() {
        return nip;
    }

    public String getNik() {
        return nik;
    }

    public String getGender() {
        return gender;
    }

    public String getPlaceOfBirth() {
        return placeOfBirth;
    }

    public String getMaritalStatus() {
        return maritalStatus;
    }

    public String getReligion() {
        return religion;
    }

    public String getLastEducation() {
        return lastEducation;
    }

    public String getRankGolongan() {
        return rankGolongan;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public Integer getRemainingLeaveDays() {
        return remainingLeaveDays;
    }

    public void setRemainingLeaveDays(Integer remainingLeaveDays) {
        this.remainingLeaveDays = remainingLeaveDays;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public String getProfilePhotoPath() {
        return profilePhotoPath;
    }

    public void setProfilePhotoPath(String profilePhotoPath) {
        this.profilePhotoPath = profilePhotoPath;
    }

    public String getTmtPangkatGolRuang() {
        return tmtPangkatGolRuang;
    }

    public LocalDate getTmtJabatan() {
        return tmtJabatan;
    }

    public LocalDate getTmtCpns() {
        return tmtCpns;
    }

    public LocalDate getTmtPns() {
        return tmtPns;
    }

    public String getMasaKerja() {
        return masaKerja;
    }

    public String getNamaLatihanJabatan() {
        return namaLatihanJabatan;
    }

    public LocalDate getTanggalLatihanJabatan() {
        return tanggalLatihanJabatan;
    }

    public String getLamaJam() {
        return lamaJam;
    }

    public String getNamaFakultasPendidikanTerakhir() {
        return namaFakultasPendidikanTerakhir;
    }

    public String getJurusanPendidikanTerakhir() {
        return jurusanPendidikanTerakhir;
    }

    public Integer getTahunLulusPendidikan() {
        return tahunLulusPendidikan;
    }

    public String getCatatanMutasi() {
        return catatanMutasi;
    }

    public String getKarpeg() {
        return karpeg;
    }

    public String getKeterangan() {
        return keterangan;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateProfile(String fullName,
                              String position,
                              String department,
                              String phone,
                              String address,
                              LocalDate dateOfBirth,
                              LocalDate joinDate,
                              String nip,
                              String nik,
                              String gender,
                              String placeOfBirth,
                              String maritalStatus,
                              String religion,
                              String lastEducation,
                              String rankGolongan,
                              String employmentStatus,
                              String tmtPangkatGolRuang,
                              LocalDate tmtJabatan,
                              LocalDate tmtCpns,
                              LocalDate tmtPns,
                              String masaKerja,
                              String namaLatihanJabatan,
                              LocalDate tanggalLatihanJabatan,
                              String lamaJam,
                              String namaFakultasPendidikanTerakhir,
                              String jurusanPendidikanTerakhir,
                              Integer tahunLulusPendidikan,
                              String catatanMutasi,
                              String karpeg,
                              String keterangan) {
        this.fullName = fullName;
        this.position = position;
        this.department = department;
        this.phone = phone;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        this.joinDate = joinDate;
        this.nip = nip;
        this.nik = nik;
        this.gender = gender;
        this.placeOfBirth = placeOfBirth;
        this.maritalStatus = maritalStatus;
        this.religion = religion;
        this.lastEducation = lastEducation;
        this.rankGolongan = rankGolongan;
        this.employmentStatus = employmentStatus;
        this.tmtPangkatGolRuang = tmtPangkatGolRuang;
        this.tmtJabatan = tmtJabatan;
        this.tmtCpns = tmtCpns;
        this.tmtPns = tmtPns;
        this.masaKerja = masaKerja;
        this.namaLatihanJabatan = namaLatihanJabatan;
        this.tanggalLatihanJabatan = tanggalLatihanJabatan;
        this.lamaJam = lamaJam;
        this.namaFakultasPendidikanTerakhir = namaFakultasPendidikanTerakhir;
        this.jurusanPendidikanTerakhir = jurusanPendidikanTerakhir;
        this.tahunLulusPendidikan = tahunLulusPendidikan;
        this.catatanMutasi = catatanMutasi;
        this.karpeg = karpeg;
        this.keterangan = keterangan;
    }
}

