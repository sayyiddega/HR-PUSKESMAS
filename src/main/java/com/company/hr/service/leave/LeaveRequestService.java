package com.company.hr.service.leave;

import com.company.hr.dto.leave.LeaveRequestCreate;
import com.company.hr.entity.employee.Employee;
import com.company.hr.entity.leave.LeaveRequest;
import com.company.hr.entity.leave.LeaveStatus;
import com.company.hr.repository.leave.LeaveRequestRepository;
import com.company.hr.service.storage.StorageService;
import com.company.hr.web.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository repository;
    private final StorageService storageService;

    public LeaveRequestService(LeaveRequestRepository repository, StorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    public List<LeaveRequest> listAll() {
        return repository.findAll();
    }

    public List<LeaveRequest> listByEmployee(Employee employee) {
        return repository.findByEmployee(employee);
    }

    @Transactional
    public LeaveRequest create(Employee employee, LeaveRequestCreate req, MultipartFile attachment) {
        String path = null;
        if (attachment != null && !attachment.isEmpty()) {
            path = storageService.storeLeaveAttachment(employee.getId(), attachment);
        }
        LeaveRequest lr = new LeaveRequest(employee, req.startDate(), req.endDate(), req.reason(), path);
        return repository.save(lr);
    }

    @Transactional
    public LeaveRequest updateStatus(Long id, LeaveStatus status) {
        LeaveRequest lr = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request", id));
        lr.setStatus(status);
        return repository.save(lr);
    }

    public long countByStatus(LeaveStatus status) {
        return repository.countByStatus(status);
    }
}

