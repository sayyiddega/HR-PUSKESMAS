package com.company.hr.controller.storage;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/files")
@SuppressWarnings("null")
public class FileController {

    private final Path baseDir;

    public FileController(@Value("${app.storage.upload-dir:uploads}") String baseDir) {
        this.baseDir = Path.of(baseDir).toAbsolutePath().normalize();
    }

    @GetMapping("/**")
    public ResponseEntity<Resource> get(HttpServletRequest request,
                                        @RequestParam(required = false) String download) {
        String uri = request.getRequestURI();
        if (uri == null) uri = "";
        
        // Extract path after /files/
        String pathWithinHandler = uri.replaceFirst("^/files/?", "");
        if (pathWithinHandler.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Decode URL-encoded path
        try {
            pathWithinHandler = java.net.URLDecoder.decode(pathWithinHandler, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            // If decoding fails, use as-is
        }
        
        pathWithinHandler = StringUtils.cleanPath(pathWithinHandler);
        
        // Security: prevent path traversal
        if (pathWithinHandler.contains("..") || pathWithinHandler.startsWith("/")) {
            return ResponseEntity.badRequest().build();
        }

        Path filePath = baseDir.resolve(pathWithinHandler).normalize();
        
        // Security: ensure file is within base directory
        if (!filePath.startsWith(baseDir)) {
            return ResponseEntity.badRequest().build();
        }

        FileSystemResource resource = new FileSystemResource(filePath);
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Determine content type
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String contentType = Files.probeContentType(filePath);
            if (contentType != null && !contentType.isEmpty()) {
                mediaType = MediaType.parseMediaType(contentType);
            }
        } catch (Exception ignored) {
            // Use default APPLICATION_OCTET_STREAM
        }

        // Get filename for Content-Disposition
        String filename = filePath.getFileName().toString();
        
        // Determine disposition: "attachment" for download, "inline" for view
        String disposition = "inline";
        if ("true".equalsIgnoreCase(download) || "1".equals(download)) {
            disposition = "attachment";
        } else {
            // For images and PDFs, use inline (view in browser)
            if (mediaType.getType().equals("image") || 
                mediaType.equals(MediaType.APPLICATION_PDF)) {
                disposition = "inline";
            } else {
                // For other types, default to attachment (download)
                disposition = "attachment";
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, mediaType.toString())
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        String.format("%s; filename=\"%s\"", disposition, filename))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .body(resource);
    }
}

