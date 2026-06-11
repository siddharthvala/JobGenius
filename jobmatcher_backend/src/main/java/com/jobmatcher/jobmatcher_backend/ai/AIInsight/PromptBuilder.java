package com.jobmatcher.jobmatcher_backend.ai.AIInsight;

import com.jobmatcher.jobmatcher_backend.ai.AIInsight.dto.AIInsightRequest;
import java.util.List;

/**
 * Builds compact, token-efficient prompts for NVIDIA NIM.
 *
 * Token optimization strategy:
 * - No verbose system prompt
 * - Comma-separated lists (saves ~30% tokens vs bullet lists)
 * - Hard output constraint: "5 bullets max"
 * - No filler instructions
 */
public class PromptBuilder {

    private PromptBuilder() {}

    /**
     * Builds a minimal prompt. Example output:
     *
     * Role: Backend Developer
     * Has: Java, Spring Boot
     * Missing: SQL, GitHub
     * Give 5 short career tips to get this role. Bullet points only.
     */
    public static String build(AIInsightRequest req) {
        String matched = join(req.getMatchedSkills());
        String missing = join(req.getMissingSkills());

        return  "Role: " + req.getTargetRole() + "\n"
                + "Has: "     + matched + "\n"
                + "Missing: " + missing + "\n"
                + "Give exactly 5 very short career tips based on missing skills and has skill.\n"
                + "Each point max 10 words.\n"
                + "No explanation.\n"
                + "Bullet points only.";
    }

    private static String join(List<String> list)   {
        if (list == null || list.isEmpty()) return "none";
        return String.join(", ", list);
    }
}