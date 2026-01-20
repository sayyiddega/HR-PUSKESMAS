package com.company.hr.controller.employee;

import com.company.hr.dto.employee.EmployeeCreateRequest;
import com.company.hr.dto.employee.EmployeeRequest;
import com.company.hr.dto.employee.EmployeeResponse;
import com.company.hr.service.employee.EmployeeService;
import com.company.hr.service.settings.UrlBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/employees")
@Tag(name = "Admin - Employees")
public class AdminEmployeeController {

    private final EmployeeService employeeService;
    private final UrlBuilder urlBuilder;

    public AdminEmployeeController(EmployeeService employeeService, UrlBuilder urlBuilder) {
        this.employeeService = employeeService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping
    @Operation(summary = "List all employees")
    public List<EmployeeResponse> list() {
        return employeeService.findAll().stream()
                .map(emp -> {
                    String photoUrl = emp.getProfilePhotoPath() != null 
                            ? urlBuilder.fileUrl(emp.getProfilePhotoPath()) 
                            : null;
                    return EmployeeResponse.from(emp, photoUrl);
                })
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee detail")
    public EmployeeResponse get(@PathVariable Long id) {
        var emp = employeeService.getById(id);
        String photoUrl = emp.getProfilePhotoPath() != null 
                ? urlBuilder.fileUrl(emp.getProfilePhotoPath()) 
                : null;
        return EmployeeResponse.from(emp, photoUrl);
    }

    @PostMapping
    @Operation(summary = "Create employee + user account")
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeCreateRequest req) {
        var emp = employeeService.create(req);
        String photoUrl = emp.getProfilePhotoPath() != null 
                ? urlBuilder.fileUrl(emp.getProfilePhotoPath()) 
                : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(EmployeeResponse.from(emp, photoUrl));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee data")
    public EmployeeResponse update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest req) {
        var emp = employeeService.update(id, req);
        String photoUrl = emp.getProfilePhotoPath() != null 
                ? urlBuilder.fileUrl(emp.getProfilePhotoPath()) 
                : null;
        return EmployeeResponse.from(emp, photoUrl);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee and user account")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

