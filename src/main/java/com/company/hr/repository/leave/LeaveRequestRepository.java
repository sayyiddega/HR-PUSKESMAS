package com.company.hr.repository.leave;

import com.company.hr.entity.employee.Employee;
import com.company.hr.entity.leave.LeaveRequest;
import com.company.hr.entity.leave.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee(Employee employee);
    long countByStatus(LeaveStatus status);
}

