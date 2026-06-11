package com.jobmatcher.jobmatcher_backend.service;


import com.jobmatcher.jobmatcher_backend.util.EmailTemplateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final EmailService emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    // ── 1. Welcome ────────────────────────────────────────────────────────────

    public void sendWelcomeEmail(String toEmail, String candidateName) {
        log.info("Sending welcome email → {}", toEmail);
        String html = EmailTemplateUtil.buildWelcomeEmail(candidateName, frontendUrl);
        emailService.sendHtmlEmail(toEmail, "Welcome to JobGenius 🚀", html);
    }

    // ── 2. Application Confirmation ───────────────────────────────────────────

    public void sendApplicationConfirmation(
            String toEmail, String candidateName,
            String jobTitle, String companyName) {

        log.info("Sending application confirmation → {} for job '{}'", toEmail, jobTitle);
        String appliedDate = LocalDate.now().format(DATE_FMT);
        String html = EmailTemplateUtil.buildApplicationConfirmationEmail(
                candidateName, jobTitle, companyName, appliedDate, frontendUrl);
        emailService.sendHtmlEmail(
                toEmail,
                "Application Received – " + jobTitle + " at " + companyName,
                html);
    }

    // ── 3. Screening ──────────────────────────────────────────────────────────

    public void sendScreeningNotification(
            String toEmail, String candidateName,
            String jobTitle, String companyName) {

        log.info("Sending screening notification → {}", toEmail);
        String html = EmailTemplateUtil.buildScreeningEmail(
                candidateName, jobTitle, companyName, frontendUrl);
        emailService.sendHtmlEmail(
                toEmail,
                "Your profile has been shortlisted – " + jobTitle,
                html);
    }

    // ── 4. Interview ──────────────────────────────────────────────────────────

    public void sendInterviewNotification(
            String toEmail, String candidateName,
            String jobTitle, String companyName) {

        log.info("Sending interview notification → {}", toEmail);
        String html = EmailTemplateUtil.buildInterviewEmail(
                candidateName, jobTitle, companyName, frontendUrl);
        emailService.sendHtmlEmail(
                toEmail,
                "Interview Round – " + jobTitle + " at " + companyName,
                html);
    }

    // ── 5. Accepted ───────────────────────────────────────────────────────────

    public void sendAcceptedNotification(
            String toEmail, String candidateName,
            String jobTitle, String companyName) {

        log.info("Sending offer notification → {}", toEmail);
        String html = EmailTemplateUtil.buildAcceptedEmail(
                candidateName, jobTitle, companyName, frontendUrl);
        emailService.sendHtmlEmail(
                toEmail,
                "🎉 Offer Letter – " + jobTitle + " at " + companyName,
                html);
    }

    // ── 6. Rejected ───────────────────────────────────────────────────────────

    public void sendRejectedNotification(
            String toEmail, String candidateName,
            String jobTitle, String companyName) {

        log.info("Sending rejection notification → {}", toEmail);
        String html = EmailTemplateUtil.buildRejectedEmail(
                candidateName, jobTitle, companyName, frontendUrl);
        emailService.sendHtmlEmail(
                toEmail,
                "Application Update – " + jobTitle + " at " + companyName,
                html);
    }

    // ── 7. Forgot Password (future-ready) ─────────────────────────────────────

    public void sendForgotPasswordNotification(
            String toEmail, String userName, String resetLink) {

        log.info("Sending password reset email → {}", toEmail);
        String html = EmailTemplateUtil.buildForgotPasswordEmail(userName, resetLink);
        emailService.sendHtmlEmail(toEmail, "Reset Your JobGenius Password", html);
    }

    // ── Dispatcher — used by ApplicationService ───────────────────────────────

    public void sendStatusUpdateNotification(
            String toEmail, String candidateName,
            String jobTitle, String companyName, String status) {

        switch (status.toUpperCase()) {
            case "SCREENING" -> sendScreeningNotification(toEmail, candidateName, jobTitle, companyName);
            case "INTERVIEW" -> sendInterviewNotification(toEmail, candidateName, jobTitle, companyName);
            case "ACCEPTED"  -> sendAcceptedNotification(toEmail, candidateName, jobTitle, companyName);
            case "REJECTED"  -> sendRejectedNotification(toEmail, candidateName, jobTitle, companyName);
            default -> log.debug("No email configured for status: {}", status);
        }
    }
}