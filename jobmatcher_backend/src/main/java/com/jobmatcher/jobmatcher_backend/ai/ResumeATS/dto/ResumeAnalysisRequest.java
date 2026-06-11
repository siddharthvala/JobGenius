package com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotBlank(message = "Job title is required")
    private String jobTitle;
}