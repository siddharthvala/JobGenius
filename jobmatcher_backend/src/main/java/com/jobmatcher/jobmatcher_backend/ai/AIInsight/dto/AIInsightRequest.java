package com.jobmatcher.jobmatcher_backend.ai.AIInsight.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIInsightRequest {

    private String targetRole;

    private List<String> matchedSkills;

    private List<String> missingSkills;
}