package com.company.hr.service.leave;

import com.company.hr.dto.leave.LeaveRequestCreate;
import com.company.hr.entity.employee.Employee;
import com.company.hr.entity.leave.LeaveRequest;
import com.company.hr.entity.leave.LeaveStatus;
import com.company.hr.repository.employee.EmployeeRepository;
import com.company.hr.repository.leave.LeaveRequestRepository;
import com.company.hr.service.storage.StorageService;
import com.company.hr.web.exception.ResourceNotFoundException;
import com.company.hr.web.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository repository;
    private final StorageService storageService;
    private final EmployeeRepository employeeRepository;

    public LeaveRequestService(LeaveRequestRepository repository,
                               StorageService storageService,
                               EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.storageService = storageService;
        this.employeeRepository = employeeRepository;
    }

    public List<LeaveRequest> listAll() {
        return repository.findAll();
    }

    public Page<LeaveRequest> listAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<LeaveRequest> listByEmployee(Employee employee) {
        return repository.findByEmployee(employee);
    }

    @Transactional
    public LeaveRequest create(Employee employee, LeaveRequestCreate req, MultipartFile attachment) {
        // Hitung durasi cuti (hari, inklusif)
        long days = ChronoUnit.DAYS.between(req.startDate(), req.endDate()) + 1;
        Integer remaining = employee.getRemainingLeaveDays();
        if (remaining != null && remaining < days) {
            throw new BadRequestException("Sisa cuti tidak mencukupi untuk pengajuan ini");
        }

        String path = null;
        if (attachment != null && !attachment.isEmpty()) {
            path = storageService.storeLeaveAttachment(employee.getId(), attachment);
        }
        LeaveRequest lr = new LeaveRequest(employee, req.startDate(), req.endDate(), req.reason(), path);
        return repository.save(lr);
    }

    @Transactional
    public LeaveRequest updateStatus(Long id, LeaveStatus status) {
        LeaveRequest lr = repository.findById(id.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Leave request", id));

        // Jika baru disetujui (transition ke APPROVED), kurangi sisa cuti
        if (status == LeaveStatus.APPROVED && lr.getStatus() != LeaveStatus.APPROVED) {
            long days = ChronoUnit.DAYS.between(lr.getStartDate(), lr.getEndDate()) + 1;
            var emp = lr.getEmployee();
            Integer remaining = emp.getRemainingLeaveDays();
            if (remaining != null) {
                int updated = remaining - (int) days;
                if (updated < 0) updated = 0;
                emp.setRemainingLeaveDays(updated);
                employeeRepository.save(emp);
            }
        }

        lr.setStatus(status);
        return repository.save(lr);
    }

    public long countByStatus(LeaveStatus status) {
        return repository.countByStatus(status);
    }
}

