package com.company.hr.controller.message;

import com.company.hr.dto.employee.EmployeeResponse;
import com.company.hr.dto.message.InternalMessageRequest;
import com.company.hr.dto.message.InternalMessageResponse;
import com.company.hr.security.CurrentUserService;
import com.company.hr.service.employee.EmployeeService;
import com.company.hr.service.message.InternalMessageService;
import com.company.hr.service.settings.UrlBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/employee/messages")
@Tag(name = "Employee - Internal Messages")
public class EmployeeMessageController {

    private final InternalMessageService messageService;
    private final EmployeeService employeeService;
    private final CurrentUserService currentUserService;
    private final UrlBuilder urlBuilder;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    public EmployeeMessageController(InternalMessageService messageService,
                                     EmployeeService employeeService,
                                     CurrentUserService currentUserService,
                                     UrlBuilder urlBuilder,
                                     ObjectMapper objectMapper,
                                     Validator validator) {
        this.messageService = messageService;
        this.employeeService = employeeService;
        this.currentUserService = currentUserService;
        this.urlBuilder = urlBuilder;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @GetMapping("/recipients")
    @Operation(summary = "List message recipients")
    public List<EmployeeResponse> getRecipients() {
        var user = currentUserService.getCurrentUser();
        var current = employeeService.findByUser(user);
        return employeeService.findAll().stream()
                .filter(emp -> !emp.getId().equals(current.getId()))
                .map(emp -> {
                    String photoUrl = emp.getProfilePhotoPath() != null
                            ? urlBuilder.fileUrl(emp.getProfilePhotoPath())
                            : null;
                    return EmployeeResponse.from(emp, photoUrl);
                })
                .toList();
    }

    @GetMapping("/inbox")
    @Operation(summary = "Get inbox messages")
    public List<InternalMessageResponse> getInbox() {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return messageService.getInbox(emp).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/sent")
    @Operation(summary = "Get sent messages")
    public List<InternalMessageResponse> getSent() {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return messageService.getSent(emp).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/thread/by-id/{id}")
    @Operation(summary = "Get message thread by message ID")
    public List<InternalMessageResponse> getThreadById(@PathVariable Long id) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return messageService.getThreadByMessageId(emp, id).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/thread/by-thread/{threadId}")
    @Operation(summary = "Get message thread by thread ID")
    public List<InternalMessageResponse> getThreadByThreadId(@PathVariable Long threadId) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return messageService.getThreadById(emp, threadId).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread message count")
    public Map<String, Long> getUnreadCount() {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return Map.of("unreadCount", messageService.getUnreadCount(emp));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get message by ID")
    public InternalMessageResponse getById(@PathVariable Long id) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return toResponse(messageService.getById(id, emp));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @Operation(summary = "Send new message (attachment optional)")
    public ResponseEntity<List<InternalMessageResponse>> send(
            @RequestPart("data") MultipartFile dataFile,
            @RequestPart(name = "attachment", required = false) MultipartFile attachment) {
        InternalMessageRequest req;
        try {
            req = objectMapper.readValue(dataFile.getBytes(), InternalMessageRequest.class);
        } catch (Exception e) {
            throw new com.company.hr.web.exception.BadRequestException("Invalid message data format");
        }

        Set<ConstraintViolation<InternalMessageRequest>> violations = validator.validate(req);
        if (!violations.isEmpty()) {
            throw new com.company.hr.web.exception.BadRequestException("Validation failed: " + violations.iterator().next().getMessage());
        }

        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        var sentList = messageService.send(emp, req, attachment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sentList.stream().map(this::toResponse).toList());
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark message as read")
    public InternalMessageResponse markAsRead(@PathVariable Long id) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        return toResponse(messageService.markAsRead(id, emp));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete message")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        var user = currentUserService.getCurrentUser();
        var emp = employeeService.findByUser(user);
        messageService.delete(id, emp);
        return ResponseEntity.noContent().build();
    }

    private InternalMessageResponse toResponse(com.company.hr.entity.message.InternalMessage msg) {
        String attachmentUrl = msg.getAttachmentPath() != null
                ? urlBuilder.fileUrl(msg.getAttachmentPath())
                : null;
        return InternalMessageResponse.from(msg, attachmentUrl);
    }
}
