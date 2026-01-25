package com.company.hr.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    private final Path baseDir;

    public StorageService(@Value("${app.storage.upload-dir:uploads}") String baseDir) throws IOException {
        this.baseDir = Path.of(baseDir);
        Files.createDirectories(this.baseDir);
    }

    public String storeEmployeeDocument(Long employeeId, MultipartFile file) {
        return store(file, "employee-docs/" + employeeId);
    }

    public String storeLeaveAttachment(Long employeeId, MultipartFile file) {
        return store(file, "leave-attachments/" + employeeId);
    }

    public String storeLogo(MultipartFile file) {
        return store(file, "logos");
    }

    public String storeLandingImage(MultipartFile file) {
        return store(file, "landing");
    }

    public String storeProfilePhoto(Long employeeId, MultipartFile file) {
        return store(file, "profile-photos/" + employeeId);
    }

    public String storeMessageAttachment(Long employeeId, MultipartFile file) {
        return store(file, "message-attachments/" + employeeId);
    }

    private String store(MultipartFile file, String subDir) {
        try {
            Path dir = baseDir.resolve(subDir);
            Files.createDirectories(dir);
            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + ext;
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return baseDir.relativize(target).toString();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }
    }
}

