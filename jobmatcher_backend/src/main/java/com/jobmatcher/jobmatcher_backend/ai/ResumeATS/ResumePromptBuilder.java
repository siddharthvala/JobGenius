package com.jobmatcher.jobmatcher_backend.ai.ResumeATS;

import java.util.List;

public class ResumePromptBuilder {

    private ResumePromptBuilder() {}

    /**
     * Combined extraction + AI scoring in ONE call.
     * Returns JSON with skills, experience, education, roles,
     * experienceScore (0-100), projectScore (0-100).
     */
    public static String buildCombinedPrompt(String resumeText, String targetRole) {
        return "Analyze this resume for a " + targetRole + " role.\n"
                + "Return ONLY valid JSON, no explanation, no markdown:\n"
                + "{\"skills\":[],\"experienceYears\":0,\"education\":\"\","
                + "\"roles\":[],\"experienceScore\":0,\"projectScore\":0}\n"
                + "Rules:\n"
                + "- skills: technical skills only, array of strings\n"
                + "- experienceYears: integer total years of professional experience (0 = fresher/student, 1 = 1 year, etc.)\n"
                + "- education: highest degree and institution, one short phrase\n"
                + "- roles: 2 most suitable job titles\n"
                + "- experienceScore: 0-100, relevance of experience for " + targetRole + "\n"
                + "- projectScore: 0-100, relevance of projects for " + targetRole + "\n\n"
                + "Resume:\n" + resumeText;
    }

    /**
     * Recommendations prompt — called only when atsScore < 90.
     */
    public static String buildRecommendationsPrompt(
            String targetRole,
            List<String> missingSkills,
            int atsScore) {
        return "Role: " + targetRole + "\n"
                + "ATS Score: " + atsScore + "/100\n"
                + "Missing skills: " + String.join(", ", missingSkills) + "\n"
                + "Give 5 short tips to improve ATS score. Bullet points only.";
    }
}


