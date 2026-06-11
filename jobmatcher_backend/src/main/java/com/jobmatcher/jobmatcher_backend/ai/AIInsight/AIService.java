package com.jobmatcher.jobmatcher_backend.ai.AIInsight;


import com.jobmatcher.jobmatcher_backend.ai.AIInsight.dto.AIInsightRequest;
import com.jobmatcher.jobmatcher_backend.ai.AIInsight.dto.AIInsightResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
        import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
        import java.util.stream.Collectors;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final RestTemplate restTemplate;

    @Value("${nvidia.nim.api.key}")
    private String apiKey;

    @Value("${nvidia.nim.api.url}")
    private String apiUrl;

    @Value("${nvidia.nim.model}")
    private String model;

    @Value("${nvidia.nim.max.tokens}")
    private int maxTokens;

    public AIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Calls NVIDIA NIM and returns career insights.
     */
    public AIInsightResponse getCareerInsights(AIInsightRequest req) {
        try {
            // 1. Build compact prompt
            String prompt = PromptBuilder.build(req);
            log.info("AI prompt built for role: {}", req.getTargetRole());

            // 2. Build request body
            Map<String, Object> body = buildRequestBody(prompt);

            // 3. Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // 4. Call NVIDIA NIM
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, entity, Map.class
            );

            // 5. Parse response
            List<String> insights = parseInsights(response.getBody());
            log.info("AI insights generated: {} tips", insights.size());
            return AIInsightResponse.of(insights);

        } catch (Exception e) {
//            log.error("AI call failed: {}", e.getMessage());
            e.printStackTrace();
            log.error("AI call failed", e);
            return AIInsightResponse.error("AI insights unavailable. Please try again.");
        }
    }

    // ── Build NVIDIA NIM request body ─────────────────────────
    private Map<String, Object> buildRequestBody(String prompt) {
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(message));
        body.put("max_tokens", maxTokens);
        body.put("temperature", 0.5);   // lower = more focused, fewer tokens
        body.put("stream", false);

        return body;
    }

    // ── Parse AI text into clean List<String> ─────────────────
    @SuppressWarnings("unchecked")
    private List<String> parseInsights(Map responseBody) {
        try {
            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) responseBody.get("choices");

            Map<String, Object> message =
                    (Map<String, Object>) choices.get(0).get("message");

            String content = (String) message.get("content");

            // Split by newline, clean bullets (•, -, *, numbers)
            return Arrays.stream(content.split("\n"))
                    .map(String::trim)
                    .filter(line -> !line.isEmpty())
                    .map(line -> line.replaceAll("^[•\\-*\\d+\\.]+\\s*", ""))
                    .filter(line -> !line.isEmpty())
                    .limit(6)                  // cap at 6 insights max
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
            return List.of("Could not parse AI response. Please try again.");
        }
    }
}
