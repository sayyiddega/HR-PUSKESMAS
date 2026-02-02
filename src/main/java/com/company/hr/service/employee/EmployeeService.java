package com.company.hr.service.employee;

import com.company.hr.dto.employee.EmployeeCreateRequest;
import com.company.hr.dto.employee.EmployeeRequest;
import com.company.hr.entity.auth.Role;
import com.company.hr.entity.auth.UserAccount;
import com.company.hr.entity.employee.Employee;
import com.company.hr.repository.auth.UserAccountRepository;
import com.company.hr.repository.employee.EmployeeRepository;
import com.company.hr.service.storage.StorageService;
import com.company.hr.web.exception.ConflictException;
import com.company.hr.web.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;
    private final Path baseDir;

    public EmployeeService(EmployeeRepository employeeRepository,
                           UserAccountRepository userAccountRepository,
                           PasswordEncoder passwordEncoder,
                           StorageService storageService,
                           @Value("${app.storage.upload-dir:uploads}") String baseDir) {
        this.employeeRepository = employeeRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageService = storageService;
        this.baseDir = Path.of(baseDir);
    }

    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    public Page<Employee> findAll(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }

    public Employee findByUser(UserAccount user) {
        return employeeRepository.findByUserAccount(user)
                .orElseGet(() -> {
                    if (user.getRole() == Role.ADMIN) {
                        Employee admin = new Employee(user, "Administrator", "Administrator", "Administration");
                        return employeeRepository.save(admin);
                    }
                    throw new ResourceNotFoundException("Employee", "profile not found for user");
                });
    }

    public Employee getById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
    }

    @Transactional
    public Employee create(EmployeeCreateRequest req) {
        if (userAccountRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already registered");
        }
        UserAccount account = new UserAccount(
                req.email().trim().toLowerCase(),
                passwordEncoder.encode(req.password()),
                req.role() == null ? Role.EMPLOYEE : req.role()
        );
        userAccountRepository.save(account);
        Employee employee = new Employee(account, req.fullName(), req.position(), req.department());
        employee.updateProfile(
                req.fullName(),
                req.position(),
                req.department(),
                req.phone(),
                req.address(),
                req.dateOfBirth(),
                req.joinDate(),
                req.nip(),
                req.nik(),
                req.gender(),
                req.placeOfBirth(),
                req.maritalStatus(),
                req.religion(),
                req.lastEducation(),
                req.rankGolongan(),
                req.employmentStatus(),
                req.tmtPangkatGolRuang(),
                req.tmtJabatan(),
                req.tmtCpns(),
                req.tmtPns(),
                req.masaKerja(),
                req.namaLatihanJabatan(),
                req.tanggalLatihanJabatan(),
                req.lamaJam(),
                req.namaFakultasPendidikanTerakhir(),
                req.jurusanPendidikanTerakhir(),
                req.tahunLulusPendidikan(),
                req.catatanMutasi(),
                req.karpeg(),
                req.keterangan()
        );
        employee.setRemainingLeaveDays(req.remainingLeaveDays());
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee update(Long id, EmployeeRequest req) {
        Employee emp = getById(id);
        emp.updateProfile(
                req.fullName(),
                req.position(),
                req.department(),
                req.phone(),
                req.address(),
                req.dateOfBirth(),
                req.joinDate(),
                req.nip() != null ? req.nip() : emp.getNip(),
                req.nik() != null ? req.nik() : emp.getNik(),
                req.gender() != null ? req.gender() : emp.getGender(),
                req.placeOfBirth() != null ? req.placeOfBirth() : emp.getPlaceOfBirth(),
                req.maritalStatus() != null ? req.maritalStatus() : emp.getMaritalStatus(),
                req.religion() != null ? req.religion() : emp.getReligion(),
                req.lastEducation() != null ? req.lastEducation() : emp.getLastEducation(),
                req.rankGolongan() != null ? req.rankGolongan() : emp.getRankGolongan(),
                req.employmentStatus() != null ? req.employmentStatus() : emp.getEmploymentStatus(),
                req.tmtPangkatGolRuang() != null ? req.tmtPangkatGolRuang() : emp.getTmtPangkatGolRuang(),
                req.tmtJabatan() != null ? req.tmtJabatan() : emp.getTmtJabatan(),
                req.tmtCpns() != null ? req.tmtCpns() : emp.getTmtCpns(),
                req.tmtPns() != null ? req.tmtPns() : emp.getTmtPns(),
                req.masaKerja() != null ? req.masaKerja() : emp.getMasaKerja(),
                req.namaLatihanJabatan() != null ? req.namaLatihanJabatan() : emp.getNamaLatihanJabatan(),
                req.tanggalLatihanJabatan() != null ? req.tanggalLatihanJabatan() : emp.getTanggalLatihanJabatan(),
                req.lamaJam() != null ? req.lamaJam() : emp.getLamaJam(),
                req.namaFakultasPendidikanTerakhir() != null ? req.namaFakultasPendidikanTerakhir() : emp.getNamaFakultasPendidikanTerakhir(),
                req.jurusanPendidikanTerakhir() != null ? req.jurusanPendidikanTerakhir() : emp.getJurusanPendidikanTerakhir(),
                req.tahunLulusPendidikan() != null ? req.tahunLulusPendidikan() : emp.getTahunLulusPendidikan(),
                req.catatanMutasi() != null ? req.catatanMutasi() : emp.getCatatanMutasi(),
                req.karpeg() != null ? req.karpeg() : emp.getKarpeg(),
                req.keterangan() != null ? req.keterangan() : emp.getKeterangan()
        );
        if (req.remainingLeaveDays() != null) {
            emp.setRemainingLeaveDays(req.remainingLeaveDays());
        }
        // Admin ganti password pegawai (opsional)
        if (req.password() != null && !req.password().isBlank()) {
            var user = emp.getUserAccount();
            if (user != null) {
                user.setPasswordHash(passwordEncoder.encode(req.password()));
                userAccountRepository.save(user);
            }
        }
        return employeeRepository.save(emp);
    }

    @Transactional
    public void delete(Long id) {
        Employee emp = getById(id);
        employeeRepository.delete(emp);
        if (emp.getUserAccount() != null) {
            userAccountRepository.delete(emp.getUserAccount());
        }
    }

    @Transactional
    public Employee upsertSelf(UserAccount user, EmployeeRequest req) {
        Employee emp = employeeRepository.findByUserAccount(user)
                .orElseGet(() -> employeeRepository.save(new Employee(user, req.fullName(), req.position(), req.department())));
        emp.updateProfile(
                req.fullName(),
                req.position(),
                req.department(),
                req.phone(),
                req.address(),
                req.dateOfBirth(),
                req.joinDate(),
                req.nip() != null ? req.nip() : emp.getNip(),
                req.nik() != null ? req.nik() : emp.getNik(),
                req.gender() != null ? req.gender() : emp.getGender(),
                req.placeOfBirth() != null ? req.placeOfBirth() : emp.getPlaceOfBirth(),
                req.maritalStatus() != null ? req.maritalStatus() : emp.getMaritalStatus(),
                req.religion() != null ? req.religion() : emp.getReligion(),
                req.lastEducation() != null ? req.lastEducation() : emp.getLastEducation(),
                req.rankGolongan() != null ? req.rankGolongan() : emp.getRankGolongan(),
                req.employmentStatus() != null ? req.employmentStatus() : emp.getEmploymentStatus(),
                req.tmtPangkatGolRuang() != null ? req.tmtPangkatGolRuang() : emp.getTmtPangkatGolRuang(),
                req.tmtJabatan() != null ? req.tmtJabatan() : emp.getTmtJabatan(),
                req.tmtCpns() != null ? req.tmtCpns() : emp.getTmtCpns(),
                req.tmtPns() != null ? req.tmtPns() : emp.getTmtPns(),
                req.masaKerja() != null ? req.masaKerja() : emp.getMasaKerja(),
                req.namaLatihanJabatan() != null ? req.namaLatihanJabatan() : emp.getNamaLatihanJabatan(),
                req.tanggalLatihanJabatan() != null ? req.tanggalLatihanJabatan() : emp.getTanggalLatihanJabatan(),
                req.lamaJam() != null ? req.lamaJam() : emp.getLamaJam(),
                req.namaFakultasPendidikanTerakhir() != null ? req.namaFakultasPendidikanTerakhir() : emp.getNamaFakultasPendidikanTerakhir(),
                req.jurusanPendidikanTerakhir() != null ? req.jurusanPendidikanTerakhir() : emp.getJurusanPendidikanTerakhir(),
                req.tahunLulusPendidikan() != null ? req.tahunLulusPendidikan() : emp.getTahunLulusPendidikan(),
                req.catatanMutasi() != null ? req.catatanMutasi() : emp.getCatatanMutasi(),
                req.karpeg() != null ? req.karpeg() : emp.getKarpeg(),
                req.keterangan() != null ? req.keterangan() : emp.getKeterangan()
        );
        return employeeRepository.save(emp);
    }

    @Transactional
    public void changePassword(UserAccount user, String newPassword) {
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userAccountRepository.save(user);
    }

    @Transactional
    public Employee uploadProfilePhoto(UserAccount user, MultipartFile file) {
        Employee emp = findByUser(user);
        
        // Validate file type (only images)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("File name is required");
        }
        String name = originalFilename.toLowerCase();
        if (!(name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png"))) {
            throw new IllegalArgumentException("Only JPG, JPEG, PNG images allowed for profile photo");
        }

        // Delete old photo if exists
        if (emp.getProfilePhotoPath() != null && !emp.getProfilePhotoPath().isEmpty()) {
            try {
                Path oldPhotoPath = baseDir.resolve(emp.getProfilePhotoPath());
                Files.deleteIfExists(oldPhotoPath);
            } catch (IOException e) {
                System.err.println("Failed to delete old profile photo: " + e.getMessage());
            }
        }

        // Store new photo
        String storedPath = storageService.storeProfilePhoto(emp.getId(), file);
        emp.setProfilePhotoPath(storedPath);
        return employeeRepository.save(emp);
    }
}

