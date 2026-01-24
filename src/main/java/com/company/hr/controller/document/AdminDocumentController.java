package com.company.hr.controller.document;

import com.company.hr.dto.document.EmployeeDocumentGroupResponse;
import com.company.hr.dto.document.EmployeeDocumentResponse;
import com.company.hr.service.document.EmployeeDocumentService;
import com.company.hr.service.settings.UrlBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/documents")
@Tag(name = "Admin - Documents")
public class AdminDocumentController {

    private final EmployeeDocumentService documentService;
    private final UrlBuilder urlBuilder;

    public AdminDocumentController(EmployeeDocumentService documentService, UrlBuilder urlBuilder) {
        this.documentService = documentService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping("/uploads")
    @Operation(summary = "List uploaded documents grouped by employee, optional filter by documentTypeId")
    public List<EmployeeDocumentGroupResponse> listUploads(@RequestParam(required = false) Long documentTypeId) {
        var docs = (documentTypeId != null
                ? documentService.listByDocumentType(documentTypeId)
                : documentService.listAll());

        Map<Long, List<EmployeeDocumentResponse>> grouped = docs.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getEmployee().getId(),
                        Collectors.mapping(d -> EmployeeDocumentResponse.from(d, urlBuilder.fileUrl(d.getStoredPath())), Collectors.toList())
                ));

        return grouped.entrySet().stream()
                .sorted(Comparator.comparingLong(Map.Entry::getKey))
                .map(e -> {
                    var anyDoc = docs.stream()
                            .filter(d -> d.getEmployee().getId().equals(e.getKey()))
                            .findFirst()
                            .orElseThrow();
                    var emp = anyDoc.getEmployee();
                    var user = emp.getUserAccount();
                    return new EmployeeDocumentGroupResponse(
                            emp.getId(),
                            emp.getFullName(),
                            user != null ? user.getEmail() : null,
                            e.getValue()
                    );
                })
                .toList();
    }
}

