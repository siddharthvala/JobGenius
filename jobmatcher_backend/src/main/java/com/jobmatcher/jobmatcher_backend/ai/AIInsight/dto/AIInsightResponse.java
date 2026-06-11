package com.jobmatcher.jobmatcher_backend.ai.AIInsight.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIInsightResponse {

    private List<String> insights;

    private boolean success;

    private String error;

    public static AIInsightResponse of(List<String> insights) {

        return new AIInsightResponse(
                insights,
                true,
                null
        );
    }

    public static AIInsightResponse error(String message) {

        return new AIInsightResponse(
                null,
                false,
                message
        );
    }
}