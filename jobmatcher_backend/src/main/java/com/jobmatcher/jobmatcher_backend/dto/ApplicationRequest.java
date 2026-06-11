package com.jobmatcher.jobmatcher_backend.dto;

import lombok.Data;

@Data
public class ApplicationRequest {
    private String coverLetter;
    private Long selectedResumeId;
}
