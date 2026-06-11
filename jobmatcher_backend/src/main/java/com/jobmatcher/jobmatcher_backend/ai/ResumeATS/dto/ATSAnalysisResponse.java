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
public class ATSAnalysisResponse {

    private List<String> extractedSkills;

    private Integer experienceYears;

    private String education;

    private List<String> suggestedRoles;

    private int atsScore;

    private int skillScore;

    private int experienceScore;

    private int projectScore;

    private int strengthScore;

    private List<String> matchedSkills;

    private List<String> missingSkills;

    private List<String> recommendations;

    private boolean success;

    private String error;

    public static ATSAnalysisResponse error(String msg) {
        return ATSAnalysisResponse.builder()
                .success(false)
                .error(msg)
                .build();
    }
}