package com.company.hr.service.message;

import com.company.hr.dto.message.InternalMessageRequest;
import com.company.hr.entity.employee.Employee;
import com.company.hr.entity.message.InternalMessage;
import com.company.hr.repository.message.InternalMessageRepository;
import com.company.hr.service.employee.EmployeeService;
import com.company.hr.service.storage.StorageService;
import com.company.hr.web.exception.ResourceNotFoundException;
import com.company.hr.web.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InternalMessageService {

    private final InternalMessageRepository repository;
    private final EmployeeService employeeService;
    private final StorageService storageService;

    public InternalMessageService(InternalMessageRepository repository, EmployeeService employeeService, StorageService storageService) {
        this.repository = repository;
        this.employeeService = employeeService;
        this.storageService = storageService;
    }

    // Returns only the latest message for each thread in the inbox
    public List<InternalMessage> getInbox(Employee employee) {
        List<Long> threadIds = repository.findDistinctThreadIdsForEmployee(employee);
        return threadIds.stream()
                .map(threadId -> {
                    List<InternalMessage> messages = repository.findMessagesInThreadForEmployee(threadId, employee);
                    return messages.stream()
                            .filter(msg -> msg.getReceiver().getId().equals(employee.getId())) // Only show messages where current employee is the receiver
                            .findFirst();
                })
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // Returns only the latest message for each thread in the sent box
    // When sender sends to multiple recipients with the same body, only 1 message per unique body+subject+threadId is returned
    // Messages are sorted by createdAt DESC (newest first)
    public List<InternalMessage> getSent(Employee employee) {
        // Get all messages sent by this employee, ordered by createdAt DESC (newest first)
        List<InternalMessage> allSentMessages = repository.findBySenderOrderByCreatedAtDesc(employee);
        
        // Group by body + subject + threadId to handle multiple recipients
        // When sending to multiple recipients with same body/subject, they share the same threadId
        // So we group by body+subject+threadId to get only 1 entry per batch send
        // Use LinkedHashMap to preserve insertion order (newest first from query)
        Map<String, InternalMessage> grouped = new LinkedHashMap<>();
        for (InternalMessage msg : allSentMessages) {
            // Normalize body and subject (trim whitespace, normalize spaces, handle null)
            String body = msg.getBody() != null ? msg.getBody().trim().replaceAll("\\s+", " ") : "";
            String subject = msg.getSubject() != null ? msg.getSubject().trim().replaceAll("\\s+", " ") : "";
            Long threadId = msg.getThreadId();
            
            // Create unique key from body + subject + threadId
            // Messages with same body, subject, and threadId are considered duplicates (same batch send)
            String key = body + "|||" + subject + "|||" + (threadId != null ? threadId.toString() : "null");
            
            // If key doesn't exist yet, add it (since query is already ordered DESC, first one is newest)
            // This ensures only 1 entry per unique body+subject+threadId combination
            if (!grouped.containsKey(key)) {
                grouped.put(key, msg);
            }
        }
        
        // Return as list (already sorted by createdAt DESC from query, LinkedHashMap preserves order)
        return new ArrayList<>(grouped.values());
    }

    public long getUnreadCount(Employee employee) {
        return repository.countByReceiverAndIsReadFalse(employee);
    }

    public List<InternalMessage> getThreadById(Employee employee, Long threadId) {
        Long safeThreadId = Objects.requireNonNull(threadId, "threadId");
        boolean hasAccess = repository.existsByThreadIdAndSenderOrThreadIdAndReceiver(safeThreadId, employee, safeThreadId, employee);
        if (!hasAccess) {
            throw new UnauthorizedException("Cannot view this thread");
        }
        return repository.findByThreadIdOrderByCreatedAtAsc(safeThreadId);
    }

    public List<InternalMessage> getThreadByMessageId(Employee employee, Long messageId) {
        Long safeMessageId = Objects.requireNonNull(messageId, "messageId");
        InternalMessage msg = repository.findById(safeMessageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", safeMessageId));
        if (msg.getThreadId() == null) {
            throw new ResourceNotFoundException("Thread", "thread_id not set");
        }
        return getThreadById(employee, msg.getThreadId());
    }

    @Transactional
    public List<InternalMessage> send(Employee sender, InternalMessageRequest req, MultipartFile attachment) {
        InternalMessage replyTo = null;
        Long replyToId = req.replyToId();
        if (replyToId != null) {
            Long safeReplyToId = Objects.requireNonNull(replyToId, "replyToId");
            replyTo = repository.findById(safeReplyToId)
                    .orElseThrow(() -> new ResourceNotFoundException("Message", safeReplyToId));
        }

        Long threadId = replyTo != null ? replyTo.getThreadId() : null;

        String storedPath = null;
        String attachmentName = null;
        String attachmentType = null;
        Long attachmentSize = null;
        if (attachment != null && !attachment.isEmpty()) {
            storedPath = storageService.storeMessageAttachment(sender.getId(), attachment);
            attachmentName = attachment.getOriginalFilename();
            attachmentType = attachment.getContentType();
            attachmentSize = attachment.getSize();
        }

        List<InternalMessage> savedMessages = new ArrayList<>();
        List<Long> receiverIds = Objects.requireNonNull(req.receiverIds(), "receiverIds");
        boolean threadInitialized = threadId != null;
        
        // Save all messages first
        for (int i = 0; i < receiverIds.size(); i++) {
            Long receiverId = receiverIds.get(i);
            Long safeReceiverId = Objects.requireNonNull(receiverId, "receiverId");
            Employee receiver = employeeService.getById(safeReceiverId);
            InternalMessage msg = new InternalMessage(sender, receiver, req.subject(), req.body(), replyTo);
            msg.setThreadId(threadId);
            if (storedPath != null) {
                msg.setAttachmentPath(storedPath);
                msg.setAttachmentName(attachmentName);
                msg.setAttachmentType(attachmentType);
                msg.setAttachmentSize(attachmentSize);
            }
            InternalMessage saved = repository.save(msg);
            savedMessages.add(saved);
            
            // Set threadId to first message's ID if not initialized
            if (!threadInitialized) {
                threadId = saved.getId();
                threadInitialized = true;
            }
        }
        
        // Now update all messages to have the same threadId
        // This ensures all messages in the same batch have the same threadId
        if (threadId != null) {
            for (InternalMessage msg : savedMessages) {
                if (!threadId.equals(msg.getThreadId())) {
                    msg.setThreadId(threadId);
                    repository.save(msg);
                }
            }
        }
        
        return savedMessages;
    }

    @Transactional
    public InternalMessage markAsRead(Long messageId, Employee employee) {
        Long safeMessageId = Objects.requireNonNull(messageId, "messageId");
        InternalMessage msg = repository.findById(safeMessageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", safeMessageId));
        
        if (!msg.getReceiver().getId().equals(employee.getId())) {
            throw new UnauthorizedException("Cannot mark message as read - not the receiver");
        }
        
        msg.setIsRead(true);
        return repository.save(msg);
    }

    public InternalMessage getById(Long messageId, Employee employee) {
        Long safeMessageId = Objects.requireNonNull(messageId, "messageId");
        InternalMessage msg = repository.findById(safeMessageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", safeMessageId));
        
        // Only sender or receiver can view the message
        if (!msg.getSender().getId().equals(employee.getId()) && 
            !msg.getReceiver().getId().equals(employee.getId())) {
            throw new UnauthorizedException("Cannot view this message");
        }
        
        return msg;
    }

    @Transactional
    public void delete(Long messageId, Employee employee) {
        Long safeMessageId = Objects.requireNonNull(messageId, "messageId");
        InternalMessage msg = repository.findById(safeMessageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", safeMessageId));
        
        // Only sender or receiver can delete the message
        if (!msg.getSender().getId().equals(employee.getId()) && 
            !msg.getReceiver().getId().equals(employee.getId())) {
            throw new UnauthorizedException("Cannot delete this message");
        }
        
        repository.delete(msg);
    }
}
