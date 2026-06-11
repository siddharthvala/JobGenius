// ============================================================
// FILE: src/main/java/com/jobmatcher/jobmatcher_backend/service/ATSApplicationService.java
// NEW file — does not replace anything existing
// ============================================================
package com.jobmatcher.jobmatcher_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.AIResumeAnalyzerService;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto.ATSScoringService;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.ResumeParserService;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.SimpleMultipartFile;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto.ExtractedResumeData;
import com.jobmatcher.jobmatcher_backend.model.Application;
import com.jobmatcher.jobmatcher_backend.model.Resume;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.List;

@Service
public class ATSApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ATSApplicationService.class);

    private final ResumeParserService     parserService;
    private final AIResumeAnalyzerService aiService;
    private final ATSScoringService       atsService;
    private final ObjectMapper            objectMapper;

    public ATSApplicationService(
            ResumeParserService parserService,
            AIResumeAnalyzerService aiService,
            ATSScoringService atsService,
            ObjectMapper objectMapper) {
        this.parserService = parserService;
        this.aiService     = aiService;
        this.atsService    = atsService;
        this.objectMapper  = objectMapper;
    }

    /**
     * Runs ATS analysis and stores snapshot into application.
     * Called ONCE at apply time — NEVER re-runs on recruiter page.
     * Failure is non-blocking — application saves even if ATS fails.
     */
    public void attachATSSnapshot(
            Application application,
            Resume resume,
            List<String> jobSkills,
            String jobTitle) {

        try {
            if (resume == null || resume.getResumeUrl() == null) {
                log.warn("No resume URL — skipping ATS snapshot for application");
                return;
            }

            // 1. Fetch resume bytes from stored URL
            byte[] bytes = new URL(resume.getResumeUrl())
                    .openStream()
                    .readAllBytes();

            // 2. Wrap as MultipartFile for ResumeParserService
            String filename = resume.getOriginalFileName() != null
                    ? resume.getOriginalFileName() : "resume.pdf";
            SimpleMultipartFile file = new SimpleMultipartFile(filename, bytes);

            // 3. Parse resume → plain text
            String resumeText = parserService.extractText(file);

            // 4. AI extraction + AI scoring (single combined NIM call)
            String targetRole = (jobTitle != null && !jobTitle.isBlank())
                    ? jobTitle : "Software Developer";
            ExtractedResumeData extracted = aiService.extractAndScore(resumeText, targetRole);

            if (!extracted.isSuccess()) {
                log.warn("ATS AI extraction failed — skipping snapshot: {}", extracted.getError());
                return;
            }

            // 5. Deterministic ATS scoring (backend logic — no AI)
            ATSScoringService.ATSScoreResult atsResult = atsService.score(
                    extracted.getSkills(),
                    jobSkills,
                    resumeText,
                    extracted.getAiExperienceScore(),
                    extracted.getAiProjectScore()
            );

            // 6. Store only 3 fields in application (as per spec)
            application.setAtsScore(atsResult.atsScore);
            application.setMatchedSkills(toJson(atsResult.matchedSkills));
            application.setMissingSkills(toJson(atsResult.missingSkills));

            log.info("ATS snapshot stored — score:{} matched:{} missing:{}",
                    atsResult.atsScore,
                    atsResult.matchedSkills.size(),
                    atsResult.missingSkills.size());

        } catch (Exception e) {
            // NEVER block the job application due to ATS failure
            log.error("ATS snapshot failed (non-blocking): {}", e.getMessage());
        }
    }

    private String toJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(
                    list == null ? List.of() : list
            );
        } catch (Exception e) {
            return "[]";
        }
    }
}