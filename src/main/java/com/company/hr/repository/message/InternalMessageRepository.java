package com.company.hr.repository.message;

import com.company.hr.entity.employee.Employee;
import com.company.hr.entity.message.InternalMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InternalMessageRepository extends JpaRepository<InternalMessage, Long> {
    List<InternalMessage> findByReceiverOrderByCreatedAtDesc(Employee receiver);
    List<InternalMessage> findBySenderOrderByCreatedAtDesc(Employee sender);
    long countByReceiverAndIsReadFalse(Employee receiver);

    boolean existsByThreadIdAndSenderOrThreadIdAndReceiver(Long threadId, Employee sender, Long threadId2, Employee receiver);

    List<InternalMessage> findByThreadIdOrderByCreatedAtAsc(Long threadId);

    // Find all unique thread IDs where the employee is either sender or receiver
    @Query("SELECT DISTINCT m.threadId FROM InternalMessage m WHERE (m.sender = :employee OR m.receiver = :employee) AND m.threadId IS NOT NULL")
    List<Long> findDistinctThreadIdsForEmployee(@Param("employee") Employee employee);

    // Find the latest message in a thread for a given user (sender or receiver)
    @Query("SELECT m FROM InternalMessage m WHERE m.threadId = :threadId AND (m.sender = :employee OR m.receiver = :employee) ORDER BY m.createdAt DESC")
    List<InternalMessage> findMessagesInThreadForEmployee(@Param("threadId") Long threadId, @Param("employee") Employee employee);
}
