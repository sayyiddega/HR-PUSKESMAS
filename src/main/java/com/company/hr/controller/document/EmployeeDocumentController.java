package com.company.hr.controller.document;

import com.company.hr.dto.document.DocumentTypeResponse;
import com.company.hr.dto.document.EmployeeDocumentListResponse;
import com.company.hr.dto.document.EmployeeDocumentResponse;
import com.company.hr.entity.document.DocumentType;
import com.company.hr.security.CurrentUserService;
import com.company.hr.service.document.DocumentTypeService;
import com.company.hr.service.document.EmployeeDocumentService;
import com.company.hr.service.employee.EmployeeService;
import com.company.hr.service.settings.UrlBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/employee/documents")
@Tag(name = "Employee - Documents")
public class EmployeeDocumentController {

    private final EmployeeService employeeService;
    private final EmployeeDocumentService documentService;
    private final DocumentTypeService documentTypeService;
    private final CurrentUserService currentUserService;
    private final UrlBuilder urlBuilder;

    public EmployeeDocumentController(EmployeeService employeeService,
                                      EmployeeDocumentService documentService,
                                      DocumentTypeService documentTypeService,
                                      CurrentUserService currentUserService,
                                      UrlBuilder urlBuilder) {
        this.employeeService = employeeService;
        this.documentService = documentService;
        this.documentTypeService = documentTypeService;
        this.currentUserService = currentUserService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping("/types")
    @Operation(summary = "List all document types (for employee)")
    public List<DocumentTypeResponse> listDocumentTypes() {
        return documentTypeService.findAll().stream()
                .map(DocumentTypeResponse::from)
                .toList();
    }

    @GetMapping
    @Operation(summary = "List uploaded documents + missing mandatory warning")
    public EmployeeDocumentListResponse list() {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        var docs = documentService.listForEmployee(emp).stream()
                .map(d -> EmployeeDocumentResponse.from(d, urlBuilder.fileUrl(d.getStoredPath())))
                .toList();
        var missing = documentTypeService.findAll().stream()
                .filter(DocumentType::isMandatory)
                .filter(dt -> !documentService.hasUploaded(emp, dt))
                .map(DocumentTypeResponse::from)
                .toList();
        return new EmployeeDocumentListResponse(docs, missing);
    }

    @PostMapping("/{documentTypeId}/upload")
    @Operation(summary = "Upload document (pdf/jpg/png)")
    public ResponseEntity<EmployeeDocumentResponse> upload(@PathVariable Long documentTypeId,
                                                           @RequestParam("file") MultipartFile file) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        var saved = documentService.upload(emp, documentTypeId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(EmployeeDocumentResponse.from(saved, urlBuilder.fileUrl(saved.getStoredPath())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete own document")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        documentService.delete(id, emp);
        return ResponseEntity.noContent().build();
    }
}

