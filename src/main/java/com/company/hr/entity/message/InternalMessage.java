package com.company.hr.entity.message;

import com.company.hr.entity.employee.Employee;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "internal_messages")
public class InternalMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Employee sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private Employee receiver;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @ManyToOne
    @JoinColumn(name = "reply_to_id")
    private InternalMessage replyTo;

    @Column(name = "thread_id")
    private Long threadId;

    @Column(length = 500)
    private String attachmentPath;

    @Column(length = 255)
    private String attachmentName;

    @Column(length = 120)
    private String attachmentType;

    private Long attachmentSize;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected InternalMessage() {
    }

    public InternalMessage(Employee sender, Employee receiver, String subject, String body, InternalMessage replyTo) {
        this.sender = sender;
        this.receiver = receiver;
        this.subject = subject;
        this.body = body;
        this.replyTo = replyTo;
    }

    public Long getId() {
        return id;
    }

    public Employee getSender() {
        return sender;
    }

    public Employee getReceiver() {
        return receiver;
    }

    public String getSubject() {
        return subject;
    }

    public String getBody() {
        return body;
    }

    public InternalMessage getReplyTo() {
        return replyTo;
    }

    public Long getThreadId() {
        return threadId;
    }

    public void setThreadId(Long threadId) {
        this.threadId = threadId;
    }

    public String getAttachmentPath() {
        return attachmentPath;
    }

    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }

    public String getAttachmentName() {
        return attachmentName;
    }

    public void setAttachmentName(String attachmentName) {
        this.attachmentName = attachmentName;
    }

    public String getAttachmentType() {
        return attachmentType;
    }

    public void setAttachmentType(String attachmentType) {
        this.attachmentType = attachmentType;
    }

    public Long getAttachmentSize() {
        return attachmentSize;
    }

    public void setAttachmentSize(Long attachmentSize) {
        this.attachmentSize = attachmentSize;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
