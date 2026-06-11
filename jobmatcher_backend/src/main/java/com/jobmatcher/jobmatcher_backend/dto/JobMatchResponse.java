package com.jobmatcher.jobmatcher_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class JobMatchResponse {
    private Long jobId;
    private String title;
    private String companyName;

    private int matchPercentage;

    private List<String> matchedSkills;
    private List<String> missingSkills;
}
