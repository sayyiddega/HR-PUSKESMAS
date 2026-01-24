package com.company.hr.entity.document;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "document_types")
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean mandatory = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected DocumentType() {
    }

    public DocumentType(String name, String description, boolean mandatory) {
        this.name = name;
        this.description = description;
        this.mandatory = mandatory;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }
}

