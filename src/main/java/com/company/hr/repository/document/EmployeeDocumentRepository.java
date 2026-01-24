package com.company.hr.repository.document;

import com.company.hr.entity.document.DocumentType;
import com.company.hr.entity.document.EmployeeDocument;
import com.company.hr.entity.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {
    List<EmployeeDocument> findByEmployee(Employee employee);
    List<EmployeeDocument> findByDocumentType(DocumentType documentType);
    boolean existsByEmployeeAndDocumentType(Employee employee, DocumentType documentType);
    Optional<EmployeeDocument> findByEmployeeAndDocumentType(Employee employee, DocumentType documentType);
}

