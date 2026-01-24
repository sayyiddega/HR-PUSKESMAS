package com.company.hr.service.document;

import com.company.hr.dto.document.DocumentTypeRequest;
import com.company.hr.entity.document.DocumentType;
import com.company.hr.repository.document.DocumentTypeRepository;
import com.company.hr.web.exception.ConflictException;
import com.company.hr.web.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentTypeService {

    private final DocumentTypeRepository repository;

    public DocumentTypeService(DocumentTypeRepository repository) {
        this.repository = repository;
    }

    public List<DocumentType> findAll() {
        return repository.findAll();
    }

    public Page<DocumentType> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public DocumentType get(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document type", id));
    }

    @Transactional
    public DocumentType create(DocumentTypeRequest req) {
        if (repository.existsByNameIgnoreCase(req.name())) {
            throw new ConflictException("Document type name already exists");
        }
        DocumentType d = new DocumentType(req.name(), req.description(), req.mandatory());
        return repository.save(d);
    }

    @Transactional
    public DocumentType update(Long id, DocumentTypeRequest req) {
        DocumentType d = get(id);
        d.setName(req.name());
        d.setDescription(req.description());
        d.setMandatory(req.mandatory());
        return repository.save(d);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(get(id));
    }
}

