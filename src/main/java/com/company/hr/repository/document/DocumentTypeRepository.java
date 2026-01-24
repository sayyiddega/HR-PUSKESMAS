package com.company.hr.repository.document;

import com.company.hr.entity.document.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {
    boolean existsByNameIgnoreCase(String name);
}

