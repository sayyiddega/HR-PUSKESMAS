package com.company.hr.controller.employee;

import com.company.hr.dto.employee.ChangePasswordRequest;
import com.company.hr.dto.employee.EmployeeRequest;
import com.company.hr.dto.employee.EmployeeResponse;
import com.company.hr.security.CurrentUserService;
import com.company.hr.service.employee.EmployeeService;
import com.company.hr.service.settings.UrlBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/employee/profile")
@Tag(name = "Employee - Profile")
public class EmployeeSelfController {

    private final EmployeeService employeeService;
    private final CurrentUserService currentUserService;
    private final UrlBuilder urlBuilder;

    public EmployeeSelfController(EmployeeService employeeService, CurrentUserService currentUserService, UrlBuilder urlBuilder) {
        this.employeeService = employeeService;
        this.currentUserService = currentUserService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping
    @Operation(summary = "Get own profile")
    public EmployeeResponse me() {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        String photoUrl = emp.getProfilePhotoPath() != null 
                ? urlBuilder.fileUrl(emp.getProfilePhotoPath()) 
                : null;
        return EmployeeResponse.from(emp, photoUrl);
    }

    @PutMapping
    @Operation(summary = "Update own profile")
    public EmployeeResponse update(@Valid @RequestBody EmployeeRequest req) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.upsertSelf(user, req);
        String photoUrl = emp.getProfilePhotoPath() != null 
                ? urlBuilder.fileUrl(emp.getProfilePhotoPath()) 
                : null;
        return EmployeeResponse.from(emp, photoUrl);
    }

    @PostMapping("/photo")
    @Operation(summary = "Upload profile photo")
    public ResponseEntity<EmployeeResponse> uploadPhoto(@RequestParam("file") MultipartFile file) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.uploadProfilePhoto(user, file);
        String photoUrl = urlBuilder.fileUrl(emp.getProfilePhotoPath());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(EmployeeResponse.from(emp, photoUrl));
    }

    @PostMapping("/password")
    @Operation(summary = "Change own password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        var user = currentUserService.getCurrentUser();
        employeeService.changePassword(user, req.newPassword());
        return ResponseEntity.noContent().build();
    }
}

