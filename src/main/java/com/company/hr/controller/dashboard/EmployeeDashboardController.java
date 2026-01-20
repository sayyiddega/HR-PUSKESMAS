package com.company.hr.controller.dashboard;

import com.company.hr.dto.dashboard.EmployeeDashboardResponse;
import com.company.hr.dto.leave.LeaveRequestResponse;
import com.company.hr.entity.leave.LeaveRequest;
import com.company.hr.entity.leave.LeaveStatus;
import com.company.hr.security.CurrentUserService;
import com.company.hr.service.document.DocumentTypeService;
import com.company.hr.service.document.EmployeeDocumentService;
import com.company.hr.service.employee.EmployeeService;
import com.company.hr.service.leave.LeaveRequestService;
import com.company.hr.service.settings.UrlBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/employee/dashboard")
@Tag(name = "Employee - Dashboard")
public class EmployeeDashboardController {

    private final EmployeeService employeeService;
    private final EmployeeDocumentService documentService;
    private final DocumentTypeService documentTypeService;
    private final LeaveRequestService leaveRequestService;
    private final CurrentUserService currentUserService;
    private final UrlBuilder urlBuilder;

    public EmployeeDashboardController(EmployeeService employeeService,
                                       EmployeeDocumentService documentService,
                                       DocumentTypeService documentTypeService,
                                       LeaveRequestService leaveRequestService,
                                       CurrentUserService currentUserService,
                                       UrlBuilder urlBuilder) {
        this.employeeService = employeeService;
        this.documentService = documentService;
        this.documentTypeService = documentTypeService;
        this.leaveRequestService = leaveRequestService;
        this.currentUserService = currentUserService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping
    @Operation(summary = "Employee dashboard summary")
    public EmployeeDashboardResponse summary() {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);

        long totalDocumentTypes = documentTypeService.findAll().size();
        long mandatoryCount = documentTypeService.findAll().stream()
                .filter(dt -> dt.isMandatory())
                .count();
        long uploadedMandatory = documentTypeService.findAll().stream()
                .filter(dt -> dt.isMandatory())
                .filter(dt -> documentService.hasUploaded(emp, dt))
                .count();

        List<LeaveRequest> allLeaves = leaveRequestService.listByEmployee(emp);
        long pendingLeaves = allLeaves.stream()
                .filter(lr -> lr.getStatus() == LeaveStatus.PENDING)
                .count();
        long approvedLeaves = allLeaves.stream()
                .filter(lr -> lr.getStatus() == LeaveStatus.APPROVED)
                .count();

        // Get latest leave request (most recent by createdAt)
        LeaveRequestResponse latestLeaveRequest = allLeaves.stream()
                .max(Comparator.comparing(LeaveRequest::getCreatedAt))
                .map(lr -> LeaveRequestResponse.from(lr, urlBuilder.fileUrl(lr.getAttachmentPath())))
                .orElse(null);

        return new EmployeeDashboardResponse(
                emp.getId(),
                totalDocumentTypes,
                documentService.listForEmployee(emp).size(),
                uploadedMandatory,
                Math.max(0, mandatoryCount - uploadedMandatory),
                pendingLeaves,
                approvedLeaves,
                latestLeaveRequest
        );
    }
}

