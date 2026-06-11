package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.ApplicationRequest;
import com.jobmatcher.jobmatcher_backend.dto.ApplicationResponse;
import com.jobmatcher.jobmatcher_backend.dto.ApplicationStatusRequest;
import com.jobmatcher.jobmatcher_backend.enums.ApplicationStatus;
import com.jobmatcher.jobmatcher_backend.enums.RoleEnum;
import com.jobmatcher.jobmatcher_backend.model.Application;
import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.model.Resume;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.ApplicationRepository;
import com.jobmatcher.jobmatcher_backend.repository.JobRepository;
import com.jobmatcher.jobmatcher_backend.repository.ResumeRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@Transactional
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ATSApplicationService atsApplicationService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private NotificationService notificationService;

    public ApplicationResponse applyForJob(Long jobId, ApplicationRequest request, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (candidate.getRole() != RoleEnum.CANDIDATE) {
            throw new RuntimeException("Only candidates can apply for jobs");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), jobId)) {
            throw new RuntimeException("You have already applied for this job");
        }

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJob(job);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setAppliedAt(LocalDateTime.now());
        application.setCoverLetter(request != null ? request.getCoverLetter() : null);

        if (request != null && request.getSelectedResumeId() != null) {
            Resume resume = resumeRepository.findById(request.getSelectedResumeId())
                    .orElseThrow(() -> new RuntimeException("Selected resume not found"));
            if (!resume.getUser().getId().equals(candidate.getId())) {
                throw new RuntimeException("Selected resume does not belong to you");
            }
            application.setSelectedResume(resume);
        }
        if (request != null && request.getSelectedResumeId() != null) {
            resumeRepository.findById(request.getSelectedResumeId())
                    .ifPresent(resume -> {
                        List<String> jobSkills = job.getSkills().stream()
                                .map(s -> s.getName())   // adjust to your Skill field name
                                .collect(Collectors.toList());
                        atsApplicationService.attachATSSnapshot(application, resume, jobSkills, job.getTitle());
                    });
        }

        Application saved = applicationRepository.save(application);

        try {
            emailNotificationService.sendApplicationConfirmation(
                    candidate.getEmail(),
                    candidate.getUsername() != null ? candidate.getUsername() : candidate.getEmail(),
                    job.getTitle(),
                    job.getCompanyName()
            );
        } catch (Exception e) {
            log.warn("Application confirmation email failed for {}: {}", candidate.getEmail(), e.getMessage());
        }

        // Notifications
        try {
            notificationService.notifyApplicationSubmitted(
                    candidate,
                    job.getCreatedBy(),   // recruiter
                    job.getTitle(),
                    job.getId(),
                    saved.getId()
            );
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }

        return new ApplicationResponse(saved);
    }

    public List<ApplicationResponse> getMyApplications(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findByCandidateId(candidate.getId())
                .stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getApplicationsForJob(Long jobId, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCreatedBy().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You are not authorized to view applications for this job");
        }

        return applicationRepository.findByJobId(jobId)
                .stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatusRequest request, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getCreatedBy().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You are not authorized to update this application");
        }

        application.setStatus(request.getStatus());
        Application saved = applicationRepository.save(application);

        try {
            User candidate = saved.getCandidate();
            Job job = saved.getJob();
            emailNotificationService.sendStatusUpdateNotification(
                    candidate.getEmail(),
                    candidate.getUsername() != null ? candidate.getUsername() : candidate.getEmail(),
                    job.getTitle(),
                    job.getCompanyName(),
                    request.getStatus().name()
            );
        } catch (Exception e) {
            log.warn("Status email failed for application {}: {}", applicationId, e.getMessage());
        }
        // Notification
        try {
            notificationService.notifyStatusUpdate(
                    saved.getCandidate(),
                    saved.getJob().getTitle(),
                    saved.getStatus(),
                    saved.getJob().getId()
            );
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
        return new ApplicationResponse(applicationRepository.save(application));
    }

    public void withdrawApplication(Long applicationId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getCandidate().getId().equals(candidate.getId())) {
            throw new RuntimeException("You are not authorized to withdraw this application");
        }
        try {
            notificationService.notifyApplicationWithdrawn(
                    application.getJob().getCreatedBy(),
                    candidate.getUsername(),
                    application.getJob().getTitle(),
                    application.getJob().getId()
            );
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
        applicationRepository.delete(application);
    }

    public boolean hasApplied(Long jobId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), jobId);
    }

    public Long getApplicationId(Long jobId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByCandidateIdAndJobId(candidate.getId(), jobId)
                .map(Application::getId)
                .orElse(null);
    }

    public Application getApplication(Long jobId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByCandidateIdAndJobId(candidate.getId(), jobId)
                .orElse(null);
    }

    public java.util.Map<String, Object> checkApplicationDetails(Long jobId, String candidateEmail) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        User candidate = userRepository.findByEmail(candidateEmail).orElse(null);
        if (candidate == null) {
            result.put("applied", false);
            result.put("applicationId", null);
            return result;
        }
        Application application = applicationRepository.findByCandidateIdAndJobId(candidate.getId(), jobId)
                .orElse(null);
        result.put("applied", application != null);
        result.put("applicationId", application != null ? application.getId() : null);
        if (application != null && application.getSelectedResume() != null) {
            result.put("resumeFileName", application.getSelectedResume().getOriginalFileName());
            result.put("resumeUrl", application.getSelectedResume().getResumeUrl());
        }
        return result;
    }
    public List<ApplicationResponse> getApplicantsSorted(Long jobId, String sort) {
        List<Application> applications;
        switch (sort) {
            case "ats_desc":
                applications = applicationRepository.findByJobIdOrderByAtsScoreDesc(jobId);
                break;
            case "ats_asc":
                applications = applicationRepository.findByJobIdOrderByAtsScoreAsc(jobId);
                break;
            default:
                applications = applicationRepository.findByJobId(jobId);
                break;
        }
        return applications.stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }
}
