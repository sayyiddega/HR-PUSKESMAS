package com.company.hr.controller.leave;

import com.company.hr.dto.leave.LeaveRequestResponse;
import com.company.hr.entity.leave.LeaveStatus;
import com.company.hr.service.leave.LeaveRequestService;
import com.company.hr.service.settings.UrlBuilder;
import com.company.hr.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/leaves")
@Tag(name = "Admin - Leave Requests")
public class AdminLeaveController {

    private final LeaveRequestService leaveRequestService;
    private final UrlBuilder urlBuilder;

    public AdminLeaveController(LeaveRequestService leaveRequestService, UrlBuilder urlBuilder) {
        this.leaveRequestService = leaveRequestService;
        this.urlBuilder = urlBuilder;
    }

    @GetMapping
    @Operation(summary = "List all leave requests")
    public List<LeaveRequestResponse> listAll() {
        return leaveRequestService.listAll().stream()
                .map(lr -> LeaveRequestResponse.from(lr, urlBuilder.fileUrl(lr.getAttachmentPath())))
                .toList();
    }

    @GetMapping("/paged")
    @Operation(summary = "List all leave requests (paged)")
    public PageResponse<LeaveRequestResponse> listAllPaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int pageIndex = Math.max(page - 1, 0);
        int pageSize = Math.max(size, 1);
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by("createdAt").descending());

        var pageResult = leaveRequestService.listAll(pageable)
                .map(lr -> LeaveRequestResponse.from(lr, urlBuilder.fileUrl(lr.getAttachmentPath())));

        return PageResponse.from(pageResult);
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve leave request")
    public ResponseEntity<LeaveRequestResponse> approve(@PathVariable Long id) {
        var lr = leaveRequestService.updateStatus(id, LeaveStatus.APPROVED);
        return ResponseEntity.ok(LeaveRequestResponse.from(lr, urlBuilder.fileUrl(lr.getAttachmentPath())));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject leave request")
    public ResponseEntity<LeaveRequestResponse> reject(@PathVariable Long id) {
        var lr = leaveRequestService.updateStatus(id, LeaveStatus.REJECTED);
        return ResponseEntity.ok(LeaveRequestResponse.from(lr, urlBuilder.fileUrl(lr.getAttachmentPath())));
    }
}

