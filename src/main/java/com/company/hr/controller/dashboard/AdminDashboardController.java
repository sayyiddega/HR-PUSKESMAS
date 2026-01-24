package com.company.hr.controller.dashboard;

import com.company.hr.dto.dashboard.AdminDashboardResponse;
import com.company.hr.entity.document.DocumentType;
import com.company.hr.entity.employee.Employee;
import com.company.hr.repository.document.EmployeeDocumentRepository;
import com.company.hr.repository.employee.EmployeeRepository;
import com.company.hr.repository.leave.LeaveRequestRepository;
import com.company.hr.entity.leave.LeaveStatus;
import com.company.hr.service.document.DocumentTypeService;
import com.company.hr.service.document.EmployeeDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@Tag(name = "Admin - Dashboard")
public class AdminDashboardController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final DocumentTypeService documentTypeService;
    private final EmployeeDocumentService employeeDocumentService;

    public AdminDashboardController(EmployeeRepository employeeRepository,
                                    EmployeeDocumentRepository employeeDocumentRepository,
                                    LeaveRequestRepository leaveRequestRepository,
                                    DocumentTypeService documentTypeService,
                                    EmployeeDocumentService employeeDocumentService) {
        this.employeeRepository = employeeRepository;
        this.employeeDocumentRepository = employeeDocumentRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.documentTypeService = documentTypeService;
        this.employeeDocumentService = employeeDocumentService;
    }

    @GetMapping
    @Operation(summary = "Admin dashboard summary")
    public AdminDashboardResponse summary() {
        List<Employee> allEmployees = employeeRepository.findAll();
        List<DocumentType> allDocumentTypes = documentTypeService.findAll();
        List<DocumentType> mandatoryTypes = allDocumentTypes.stream()
                .filter(DocumentType::isMandatory)
                .toList();

        // Calculate document completion stats
        long employeesWithCompleteDocs = allEmployees.stream()
                .filter(emp -> {
                    if (mandatoryTypes.isEmpty()) return true; // No mandatory docs = all complete
                    return mandatoryTypes.stream()
                            .allMatch(type -> employeeDocumentService.hasUploaded(emp, type));
                })
                .count();
        long employeesWithIncompleteDocs = allEmployees.size() - employeesWithCompleteDocs;

        // Calculate documents need review (employees missing mandatory docs)
        long documentsNeedReview = employeesWithIncompleteDocs;

        // Calculate position distribution
        Map<String, Long> positionDistribution = allEmployees.stream()
                .filter(emp -> emp.getPosition() != null && !emp.getPosition().trim().isEmpty())
                .collect(Collectors.groupingBy(
                        Employee::getPosition,
                        Collectors.counting()
                ));

        return new AdminDashboardResponse(
                allEmployees.size(),
                allDocumentTypes.size(),
                employeeDocumentRepository.count(),
                leaveRequestRepository.countByStatus(LeaveStatus.PENDING),
                leaveRequestRepository.countByStatus(LeaveStatus.APPROVED),
                leaveRequestRepository.countByStatus(LeaveStatus.REJECTED),
                employeesWithCompleteDocs,
                employeesWithIncompleteDocs,
                positionDistribution,
                documentsNeedReview
        );
    }
}

