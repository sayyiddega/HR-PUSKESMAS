package com.company.hr.controller.leave;

import com.company.hr.dto.leave.LeaveRequestCreate;
import com.company.hr.dto.leave.LeaveRequestResponse;
import com.company.hr.security.CurrentUserService;
import com.company.hr.service.employee.EmployeeService;
import com.company.hr.service.leave.LeaveRequestService;
import com.company.hr.service.settings.UrlBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/employee/leaves")
@Tag(name = "Employee - Leave Requests")
public class EmployeeLeaveController {

    private final EmployeeService employeeService;
    private final LeaveRequestService leaveRequestService;
    private final CurrentUserService currentUserService;
    private final UrlBuilder urlBuilder;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public EmployeeLeaveController(EmployeeService employeeService,
                                   LeaveRequestService leaveRequestService,
                                   CurrentUserService currentUserService,
                                   UrlBuilder urlBuilder,
                                   ObjectMapper objectMapper,
                                   Validator validator) {
        this.employeeService = employeeService;
        this.leaveRequestService = leaveRequestService;
        this.currentUserService = currentUserService;
        this.urlBuilder = urlBuilder;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @GetMapping
    @Operation(summary = "List own leave requests")
    public List<LeaveRequestResponse> list() {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return leaveRequestService.listByEmployee(emp).stream()
                .map(lr -> LeaveRequestResponse.from(lr, urlBuilder.fileUrl(lr.getAttachmentPath())))
                .toList();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @Operation(summary = "Create leave request (attachment optional)")
    public ResponseEntity<LeaveRequestResponse> create(
            @RequestPart("data") MultipartFile dataPart,
            @RequestPart(name = "attachment", required = false) MultipartFile attachment) {
        try {
            // Parse JSON from multipart data
            String jsonContent = new String(dataPart.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            LeaveRequestCreate req = objectMapper.readValue(jsonContent, LeaveRequestCreate.class);
            
            // Validate
            var violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String errors = violations.stream()
                        .map(ConstraintViolation::getMessage)
                        .reduce((a, b) -> a + "; " + b)
                        .orElse("Validation failed");
                throw new IllegalArgumentException(errors);
            }
            
            var user = currentUserService.getCurrentUser();
            var emp = employeeService.findByUser(user);
            var saved = leaveRequestService.create(emp, req, attachment);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(LeaveRequestResponse.from(saved, urlBuilder.fileUrl(saved.getAttachmentPath())));
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse leave request data: " + e.getMessage(), e);
        }
    }
}

