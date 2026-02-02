package com.company.hr.dto.employee;

import com.company.hr.entity.employee.Employee;

import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String email,
        String fullName,
        String position,
        String department,
        String phone,
        String address,
        LocalDate dateOfBirth,
        LocalDate joinDate,
        String profilePhotoPath,
        String profilePhotoUrl,

        // Enriched biodata
        String nip,
        String nik,
        String gender,
        String placeOfBirth,
        String maritalStatus,
        String religion,
        String lastEducation,
        String rankGolongan,
        String employmentStatus,
        Integer remainingLeaveDays,

        // Extended ASN/PNS fields
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
        String keterangan
) {
    public static EmployeeResponse from(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getUserAccount() != null ? e.getUserAccount().getEmail() : null,
                e.getFullName(),
                e.getPosition(),
                e.getDepartment(),
                e.getPhone(),
                e.getAddress(),
                e.getDateOfBirth(),
                e.getJoinDate(),
                e.getProfilePhotoPath(),
                null, // URL will be set by controller
                e.getNip(),
                e.getNik(),
                e.getGender(),
                e.getPlaceOfBirth(),
                e.getMaritalStatus(),
                e.getReligion(),
                e.getLastEducation(),
                e.getRankGolongan(),
                e.getEmploymentStatus(),
                e.getRemainingLeaveDays(),
                e.getTmtPangkatGolRuang(),
                e.getTmtJabatan(),
                e.getTmtCpns(),
                e.getTmtPns(),
                e.getMasaKerja(),
                e.getNamaLatihanJabatan(),
                e.getTanggalLatihanJabatan(),
                e.getLamaJam(),
                e.getNamaFakultasPendidikanTerakhir(),
                e.getJurusanPendidikanTerakhir(),
                e.getTahunLulusPendidikan(),
                e.getCatatanMutasi(),
                e.getKarpeg(),
                e.getKeterangan()
        );
    }

    public static EmployeeResponse from(Employee e, String profilePhotoUrl) {
        return new EmployeeResponse(
                e.getId(),
                e.getUserAccount() != null ? e.getUserAccount().getEmail() : null,
                e.getFullName(),
                e.getPosition(),
                e.getDepartment(),
                e.getPhone(),
                e.getAddress(),
                e.getDateOfBirth(),
                e.getJoinDate(),
                e.getProfilePhotoPath(),
                profilePhotoUrl,
                e.getNip(),
                e.getNik(),
                e.getGender(),
                e.getPlaceOfBirth(),
                e.getMaritalStatus(),
                e.getReligion(),
                e.getLastEducation(),
                e.getRankGolongan(),
                e.getEmploymentStatus(),
                e.getRemainingLeaveDays(),
                e.getTmtPangkatGolRuang(),
                e.getTmtJabatan(),
                e.getTmtCpns(),
                e.getTmtPns(),
                e.getMasaKerja(),
                e.getNamaLatihanJabatan(),
                e.getTanggalLatihanJabatan(),
                e.getLamaJam(),
                e.getNamaFakultasPendidikanTerakhir(),
                e.getJurusanPendidikanTerakhir(),
                e.getTahunLulusPendidikan(),
                e.getCatatanMutasi(),
                e.getKarpeg(),
                e.getKeterangan()
        );
    }
}

