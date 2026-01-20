package com.company.hr.service.document;

import com.company.hr.entity.document.DocumentType;
import com.company.hr.entity.document.EmployeeDocument;
import com.company.hr.entity.employee.Employee;
import com.company.hr.repository.document.DocumentTypeRepository;
import com.company.hr.repository.document.EmployeeDocumentRepository;
import com.company.hr.service.storage.StorageService;
import com.company.hr.web.exception.BadRequestException;
import com.company.hr.web.exception.ResourceNotFoundException;
import com.company.hr.web.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeDocumentService {

    private final EmployeeDocumentRepository repository;
    private final DocumentTypeRepository documentTypeRepository;
    private final StorageService storageService;
    private final Path baseDir;

    public EmployeeDocumentService(EmployeeDocumentRepository repository,
                                   DocumentTypeRepository documentTypeRepository,
                                   StorageService storageService,
                                   @Value("${app.storage.upload-dir:uploads}") String baseDir) {
        this.repository = repository;
        this.documentTypeRepository = documentTypeRepository;
        this.storageService = storageService;
        this.baseDir = Path.of(baseDir);
    }

    public List<EmployeeDocument> listForEmployee(Employee employee) {
        return repository.findByEmployee(employee);
    }

    public List<EmployeeDocument> listByDocumentType(Long documentTypeId) {
        DocumentType type = documentTypeRepository.findById(documentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Document type", documentTypeId));
        return repository.findByDocumentType(type);
    }

    public List<EmployeeDocument> listAll() {
        return repository.findAll();
    }

    @Transactional
    public EmployeeDocument upload(Employee employee, Long documentTypeId, MultipartFile file) {
        DocumentType type = documentTypeRepository.findById(documentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Document type", documentTypeId));
        validateFileType(file);
        
        // Check if document already exists for this employee and document type
        Optional<EmployeeDocument> existingDoc = repository.findByEmployeeAndDocumentType(employee, type);
        
        // Delete old document and file if exists
        if (existingDoc.isPresent()) {
            EmployeeDocument oldDoc = existingDoc.get();
            // Delete physical file
            try {
                Path filePath = baseDir.resolve(oldDoc.getStoredPath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log error but continue - file might already be deleted
                System.err.println("Failed to delete old file: " + e.getMessage());
            }
            // Delete database record
            repository.delete(oldDoc);
        }
        
        // Store new file
        String storedPath = storageService.storeEmployeeDocument(employee.getId(), file);
        EmployeeDocument doc = new EmployeeDocument(employee, type, file.getOriginalFilename(), storedPath, file.getContentType(), file.getSize());
        return repository.save(doc);
    }

    public boolean hasUploaded(Employee employee, DocumentType type) {
        return repository.existsByEmployeeAndDocumentType(employee, type);
    }

    @Transactional
    public void delete(Long id, Employee employee) {
        EmployeeDocument doc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
        if (!doc.getEmployee().getId().equals(employee.getId())) {
            throw new UnauthorizedException("Cannot delete document of other employee");
        }
        repository.delete(doc);
    }

    private void validateFileType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        String originalFilename = file.getOriginalFilename();
        String name = (originalFilename == null ? "" : originalFilename).toLowerCase();
        if (!(name.endsWith(".pdf") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png"))) {
            throw new BadRequestException("Only pdf, jpg, jpeg, png allowed");
        }
    }
}

