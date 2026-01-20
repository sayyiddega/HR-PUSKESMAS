package com.company.hr.repository.employee;

import com.company.hr.entity.auth.UserAccount;
import com.company.hr.entity.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserAccount(UserAccount userAccount);
}

