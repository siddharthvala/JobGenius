package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.Resume;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ResumeResponse {

    private final Long id;
    private final String originalFileName;
    private final String resumeUrl;
    private final boolean primary;
    private final LocalDateTime uploadedAt;

    public ResumeResponse(Resume resume) {
        this.id = resume.getId();
        this.originalFileName = resume.getOriginalFileName();
        this.resumeUrl = resume.getResumeUrl();
        this.primary = resume.isPrimary();
        this.uploadedAt = resume.getUploadedAt();
    }
}
