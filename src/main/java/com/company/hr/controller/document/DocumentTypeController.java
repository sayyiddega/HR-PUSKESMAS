package com.company.hr.controller.document;

import com.company.hr.dto.document.DocumentTypeRequest;
import com.company.hr.dto.document.DocumentTypeResponse;
import com.company.hr.service.document.DocumentTypeService;
import com.company.hr.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/document-types")
@Tag(name = "Admin - Document Types")
public class DocumentTypeController {

    private final DocumentTypeService service;

    public DocumentTypeController(DocumentTypeService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List document types")
    public List<DocumentTypeResponse> list() {
        return service.findAll().stream().map(DocumentTypeResponse::from).toList();
    }

    @GetMapping("/paged")
    @Operation(summary = "List document types (paged)")
    public PageResponse<DocumentTypeResponse> listPaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
      int pageIndex = Math.max(page - 1, 0);
      int pageSize = Math.max(size, 1);
      Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by("name").ascending());

      var pageResult = service.findAll(pageable).map(DocumentTypeResponse::from);
      return PageResponse.from(pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document type")
    public DocumentTypeResponse get(@PathVariable Long id) {
        return DocumentTypeResponse.from(service.get(id));
    }

    @PostMapping
    @Operation(summary = "Create document type")
    public ResponseEntity<DocumentTypeResponse> create(@Valid @RequestBody DocumentTypeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(DocumentTypeResponse.from(service.create(req)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update document type")
    public DocumentTypeResponse update(@PathVariable Long id, @Valid @RequestBody DocumentTypeRequest req) {
        return DocumentTypeResponse.from(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete document type")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

