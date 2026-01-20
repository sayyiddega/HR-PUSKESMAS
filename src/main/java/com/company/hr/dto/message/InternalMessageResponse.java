package com.company.hr.dto.message;

import com.company.hr.entity.message.InternalMessage;

import java.time.Instant;

public record InternalMessageResponse(
        Long id,
        Long senderId,
        String senderName,
        String senderEmail,
        Long receiverId,
        String receiverName,
        String receiverEmail,
        String subject,
        String body,
        Long replyToId,
        Long threadId,
        String attachmentName,
        String attachmentType,
        Long attachmentSize,
        String attachmentUrl,
        Boolean isRead,
        Instant createdAt
) {
    public static InternalMessageResponse from(InternalMessage msg) {
        return new InternalMessageResponse(
                msg.getId(),
                msg.getSender().getId(),
                msg.getSender().getFullName(),
                msg.getSender().getUserAccount() != null ? msg.getSender().getUserAccount().getEmail() : null,
                msg.getReceiver().getId(),
                msg.getReceiver().getFullName(),
                msg.getReceiver().getUserAccount() != null ? msg.getReceiver().getUserAccount().getEmail() : null,
                msg.getSubject(),
                msg.getBody(),
                msg.getReplyTo() != null ? msg.getReplyTo().getId() : null,
                msg.getThreadId(),
                msg.getAttachmentName(),
                msg.getAttachmentType(),
                msg.getAttachmentSize(),
                null,
                msg.getIsRead(),
                msg.getCreatedAt()
        );
    }

    public static InternalMessageResponse from(InternalMessage msg, String attachmentUrl) {
        return new InternalMessageResponse(
                msg.getId(),
                msg.getSender().getId(),
                msg.getSender().getFullName(),
                msg.getSender().getUserAccount() != null ? msg.getSender().getUserAccount().getEmail() : null,
                msg.getReceiver().getId(),
                msg.getReceiver().getFullName(),
                msg.getReceiver().getUserAccount() != null ? msg.getReceiver().getUserAccount().getEmail() : null,
                msg.getSubject(),
                msg.getBody(),
                msg.getReplyTo() != null ? msg.getReplyTo().getId() : null,
                msg.getThreadId(),
                msg.getAttachmentName(),
                msg.getAttachmentType(),
                msg.getAttachmentSize(),
                attachmentUrl,
                msg.getIsRead(),
                msg.getCreatedAt()
        );
    }
}
