package com.jobmatcher.jobmatcher_backend.ai.AIInsight;

import com.jobmatcher.jobmatcher_backend.ai.AIInsight.dto.AIInsightRequest;
import com.jobmatcher.jobmatcher_backend.ai.AIInsight.dto.AIInsightResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/career-insights")
    public ResponseEntity<AIInsightResponse> getCareerInsights(
            @RequestBody AIInsightRequest request) {

        AIInsightResponse response = aiService.getCareerInsights(request);
        return ResponseEntity.ok(response);
    }
}