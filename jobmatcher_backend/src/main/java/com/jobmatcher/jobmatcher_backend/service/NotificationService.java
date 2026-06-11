package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.NotificationResponse;
import com.jobmatcher.jobmatcher_backend.dto.UnreadCountResponse;
import com.jobmatcher.jobmatcher_backend.enums.ApplicationStatus;
import com.jobmatcher.jobmatcher_backend.enums.NotificationType;
import com.jobmatcher.jobmatcher_backend.model.*;
import com.jobmatcher.jobmatcher_backend.repository.NotificationRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ── Core create ───────────────────────────────────────────────────────────

    public void createNotification(User user, String title, String message,
                                   NotificationType type, String redirectUrl) {
        try {
            Notification n = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .redirectUrl(redirectUrl)
                    .read(false)
                    .build();
            notificationRepository.save(n);
            log.info("Notification created → userId={} type={}", user.getId(), type);
        } catch (Exception e) {
            log.error("Failed to create notification → userId={} reason={}", user.getId(), e.getMessage());
        }
    }

    // ── Fetch ─────────────────────────────────────────────────────────────────

    public Page<NotificationResponse> getUserNotifications(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(NotificationResponse::fromEntity);
    }

    public UnreadCountResponse getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        long count = notificationRepository.countByUserIdAndReadFalse(user.getId());
        return new UnreadCountResponse(count);
    }

    // ── Mark read ─────────────────────────────────────────────────────────────

    @Transactional
    public void markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        int updated = notificationRepository.markAsRead(notificationId, user.getId());
        if (updated == 0) {
            throw new RuntimeException("Notification not found or not yours");
        }
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.markAllAsRead(user.getId());
    }

    // ── Business triggers ─────────────────────────────────────────────────────

    // Called when candidate applies
    public void notifyApplicationSubmitted(User candidate, User recruiter,
                                           String jobTitle, Long jobId, Long applicationId) {
        // Candidate
        createNotification(candidate,
                "Application Submitted",
                "Your application for " + jobTitle + " was submitted successfully.",
                NotificationType.APPLICATION_APPLIED,
                "/my-applications");

        // Recruiter
        createNotification(recruiter,
                "New Applicant",
                candidate.getUsername() + " applied for " + jobTitle,
                NotificationType.NEW_APPLICANT,
                "/applicants/" + jobId);
    }

    // Called when recruiter changes status
    public void notifyStatusUpdate(User candidate, String jobTitle,
                                   ApplicationStatus status, Long jobId) {
        switch (status) {
            case SCREENING -> createNotification(candidate,
                    "Application Shortlisted",
                    "Your application for " + jobTitle + " moved to screening stage.",
                    NotificationType.APPLICATION_SCREENING,
                    "/my-applications");

            case INTERVIEW -> createNotification(candidate,
                    "Interview Selected 🎉",
                    "You have been selected for the interview round for " + jobTitle,
                    NotificationType.APPLICATION_INTERVIEW,
                    "/my-applications");

            case ACCEPTED -> createNotification(candidate,
                    "Offer Received 🏆",
                    "Congratulations! You received an offer for " + jobTitle,
                    NotificationType.APPLICATION_ACCEPTED,
                    "/my-applications");

            case REJECTED -> createNotification(candidate,
                    "Application Update",
                    "Your application for " + jobTitle + " was not selected.",
                    NotificationType.APPLICATION_REJECTED,
                    "/my-applications");

            default -> log.debug("No notification configured for status: {}", status);
        }
    }

    // Called when candidate withdraws
    public void notifyApplicationWithdrawn(User recruiter, String candidateName,
                                           String jobTitle, Long jobId) {
        createNotification(recruiter,
                "Application Withdrawn",
                candidateName + " withdrew their application for " + jobTitle,
                NotificationType.APPLICATION_WITHDRAWN,
                "/applicants/" + jobId);
    }
}