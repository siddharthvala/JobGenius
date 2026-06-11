package com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedResumeData {

    private List<String> skills;

    private Integer experienceYears;

    private String education;

    private List<String> suggestedRoles;

    private String rawText;

    private int aiExperienceScore;

    private int aiProjectScore;

    private boolean success;

    private String error;

    public static ExtractedResumeData error(String msg) {
        return ExtractedResumeData.builder()
                .success(false)
                .error(msg)
                .build();
    }
}