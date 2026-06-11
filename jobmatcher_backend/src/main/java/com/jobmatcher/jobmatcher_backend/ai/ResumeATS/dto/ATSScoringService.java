package com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ATSScoringService {

    private static final Logger log = LoggerFactory.getLogger(ATSScoringService.class);

    @Value("${ats.weight.skills:60}")
    private int weightSkills;

    @Value("${ats.weight.experience:20}")
    private int weightExperience;

    @Value("${ats.weight.projects:10}")
    private int weightProjects;

    @Value("${ats.weight.strength:10}")
    private int weightStrength;

    private static final List<String> STRENGTH_KEYWORDS = List.of(
            "internship", "intern", "certification", "open source", "contribution",
            "deployed", "production", "docker", "aws", "gcp", "azure", "agile",
            "scrum", "team", "led", "achieved", "github", "linkedin", "published", "hackathon"
    );

    /**
     * Hybrid ATS scoring:
     *   skillScore    → deterministic backend logic
     *   experienceScore → AI-provided score
     *   projectScore  → AI-provided score
     *   strengthScore → deterministic backend logic
     */
    public ATSScoreResult score(
            List<String> resumeSkills,
            List<String> jobRequiredSkills,
            String resumeText,
            int aiExperienceScore,
            int aiProjectScore) {

        String textLower = resumeText.toLowerCase();

        // 1. Skills Match — deterministic (60%)
        List<String> matched  = findMatched(resumeSkills, jobRequiredSkills);
        List<String> missing  = findMissing(resumeSkills, jobRequiredSkills);
        int skillRaw   = jobRequiredSkills.isEmpty() ? 100
                : (int)((matched.size() * 100.0) / jobRequiredSkills.size());
        int skillScore = (int)(skillRaw * weightSkills / 100.0);

        // 2. Experience Relevance — AI (20%)
        int expScore = (int)(clamp(aiExperienceScore) * weightExperience / 100.0);

        // 3. Project Relevance — AI (10%)
        int projScore = (int)(clamp(aiProjectScore) * weightProjects / 100.0);

        // 4. Resume Strength — deterministic (10%)
        int strengthRaw   = scoreStrength(textLower);
        int strengthScore = (int)(strengthRaw * weightStrength / 100.0);

        // 5. Final score
        int atsScore = Math.min(100, skillScore + expScore + projScore + strengthScore);

        log.info("Hybrid ATS — skills:{} exp(AI):{} proj(AI):{} strength:{} → total:{}",
                skillScore, expScore, projScore, strengthScore, atsScore);

        return new ATSScoreResult(
                atsScore, skillScore, expScore, projScore, strengthScore,
                matched, missing
        );
    }

    private List<String> findMatched(List<String> resumeSkills, List<String> jobSkills) {
        Set<String> resumeLower = resumeSkills.stream()
                .map(String::toLowerCase).collect(Collectors.toSet());
        return jobSkills.stream()
                .filter(s -> resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());
    }

    private List<String> findMissing(List<String> resumeSkills, List<String> jobSkills) {
        Set<String> resumeLower = resumeSkills.stream()
                .map(String::toLowerCase).collect(Collectors.toSet());
        return jobSkills.stream()
                .filter(s -> !resumeLower.contains(s.toLowerCase()))
                .collect(Collectors.toList());
    }

    private int scoreStrength(String text) {
        long hits = STRENGTH_KEYWORDS.stream().filter(text::contains).count();
        return (int) Math.min(100, (hits * 100.0 / 5));
    }

    private int clamp(int val) {
        return Math.max(0, Math.min(100, val));
    }

    // ── Result holder ──────────────────────────────────────────
    public static class ATSScoreResult {
        public final int          atsScore, skillScore, experienceScore, projectScore, strengthScore;
        public final List<String> matchedSkills, missingSkills;

        public ATSScoreResult(int ats, int skill, int exp, int proj, int str,
                              List<String> matched, List<String> missing) {
            this.atsScore        = ats;
            this.skillScore      = skill;
            this.experienceScore = exp;
            this.projectScore    = proj;
            this.strengthScore   = str;
            this.matchedSkills   = matched;
            this.missingSkills   = missing;
        }
    }
}


