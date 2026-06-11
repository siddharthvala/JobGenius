package com.jobmatcher.jobmatcher_backend.ai.ResumeATS;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto.ExtractedResumeData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIResumeAnalyzerService {

    private static final Logger log = LoggerFactory.getLogger(AIResumeAnalyzerService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${nvidia.nim.api.key}")
    private String apiKey;

    @Value("${nvidia.nim.api.url}")
    private String apiUrl;

    @Value("${nvidia.nim.model}")
    private String model;

    // Constructor injection — no new ObjectMapper()
    public AIResumeAnalyzerService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    // ── Combined: extract + score in ONE NIM call ──────────────
    public ExtractedResumeData extractAndScore(String resumeText, String targetRole) {
        try {
            String prompt      = ResumePromptBuilder.buildCombinedPrompt(resumeText, targetRole);
            String aiResponse  = callNvidiaNIM(prompt, 450);

            log.debug("Raw AI extraction response: {}", aiResponse);

            // Extract JSON object from response (handles markdown fences & extra text)
            String json = aiResponse
                    .replaceAll("(?s)```json\\s*", "")
                    .replaceAll("```", "")
                    .trim();

            // Find first { ... } block in case AI adds extra text
            int start = json.indexOf('{');
            int end   = json.lastIndexOf('}');
            if (start != -1 && end != -1 && end > start) {
                json = json.substring(start, end + 1);
            }

            log.info("Parsed JSON from AI: {}", json);
            Map<String, Object> parsed = objectMapper.readValue(json, Map.class);

            ExtractedResumeData data = new ExtractedResumeData();
            data.setSkills(castToStringList(parsed.get("skills")));
            data.setExperienceYears(toInt(parsed.getOrDefault("experienceYears", 0)));
            data.setEducation(String.valueOf(parsed.getOrDefault("education",  "Not specified")));
            data.setSuggestedRoles(castToStringList(parsed.get("roles")));
            data.setRawText(resumeText);
            data.setAiExperienceScore(toInt(parsed.get("experienceScore")));
            data.setAiProjectScore(toInt(parsed.get("projectScore")));
            data.setSuccess(true);

            log.info("AI extraction done — expScore:{} projScore:{}",
                    data.getAiExperienceScore(), data.getAiProjectScore());
            return data;

        } catch (Exception e) {
            log.error("AI extraction failed: {}", e.getMessage(), e);
            return ExtractedResumeData.error("AI extraction failed. Please try again.");
        }
    }

    // ── Recommendations — called only when needed ──────────────
    public List<String> generateRecommendations(
            String targetRole,
            List<String> missingSkills,
            int atsScore) {
        try {
            String prompt   = ResumePromptBuilder.buildRecommendationsPrompt(targetRole, missingSkills, atsScore);
            String response = callNvidiaNIM(prompt, 300);

            return Arrays.stream(response.split("\n"))
                    .map(String::trim)
                    .filter(l -> !l.isEmpty())
                    .map(l -> l.replaceAll("^[•\\-*\\d+\\.]+\\s*", ""))
                    .filter(l -> !l.isEmpty())
                    .limit(5)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Recommendations failed: {}", e.getMessage());
            return List.of(
                    "Focus on the missing skills listed above",
                    "Build portfolio projects using required technologies",
                    "Practice coding challenges on LeetCode or HackerRank",
                    "Add measurable achievements to your resume",
                    "Contribute to open-source projects on GitHub"
            );
        }
    }

    // ── Shared NIM call — type-safe ParameterizedTypeReference ─
    private String callNvidiaNIM(String prompt, int maxTokens) {
        Map<String, Object> message = Map.of("role", "user", "content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model",       model);
        body.put("messages",    List.of(message));
        body.put("max_tokens",  maxTokens);
        body.put("temperature", 0.3);
        body.put("stream",      false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null) throw new RuntimeException("Empty response from AI service");

        List<Map<String, Object>> choices =
                (List<Map<String, Object>>) responseBody.get("choices");
        if (choices == null || choices.isEmpty()) throw new RuntimeException("No choices in AI response");

        Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
        if (msg == null) throw new RuntimeException("No message in AI response");

        return (String) msg.get("content");
    }

    private List<String> castToStringList(Object obj) {
        if (obj instanceof List<?>) {
            return ((List<?>) obj).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    private int toInt(Object val) {
        if (val instanceof Integer) return (Integer) val;
        if (val instanceof Number)  return ((Number) val).intValue();
        try { return Integer.parseInt(String.valueOf(val)); }
        catch (Exception e) { return 50; }
    }
}

