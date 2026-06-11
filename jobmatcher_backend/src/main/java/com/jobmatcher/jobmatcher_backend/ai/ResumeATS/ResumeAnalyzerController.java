package com.jobmatcher.jobmatcher_backend.ai.ResumeATS;

import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto.ATSAnalysisResponse;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto.ATSScoringService;
import com.jobmatcher.jobmatcher_backend.ai.ResumeATS.dto.ExtractedResumeData;
import com.jobmatcher.jobmatcher_backend.dto.JobResponse;
import com.jobmatcher.jobmatcher_backend.model.Resume;
import com.jobmatcher.jobmatcher_backend.repository.ResumeRepository;
import com.jobmatcher.jobmatcher_backend.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/resume")
public class ResumeAnalyzerController {

    private static final Logger log = LoggerFactory.getLogger(ResumeAnalyzerController.class);

    private final ResumeParserService     parserService;
    private final AIResumeAnalyzerService aiService;
    private final ATSScoringService       atsService;
    private final JobService              jobService;
    private final ResumeRepository        resumeRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResumeAnalyzerController(
            ResumeParserService parserService,
            AIResumeAnalyzerService aiService,
            ATSScoringService atsService,
            JobService jobService,
            ResumeRepository resumeRepository) {
        this.parserService    = parserService;
        this.aiService        = aiService;
        this.atsService       = atsService;
        this.jobService       = jobService;
        this.resumeRepository = resumeRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<ATSAnalysisResponse> analyze(
            @RequestParam(value = "file",     required = false) MultipartFile file,
            @RequestParam(value = "resumeId", required = false) Long resumeId,
            @RequestParam(value = "jobId",    required = false) Long jobId) {
        try {
            String resumeText;

            if (resumeId != null) {
                Resume resume = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new IllegalArgumentException("Resume not found."));
                resumeText = parserService.extractFromPath(
                        Paths.get(uploadDir, resume.getStoredFileName()),
                        resume.getOriginalFileName());
            } else if (file != null && !file.isEmpty()) {
                resumeText = parserService.extractText(file);
            } else {
                return ResponseEntity.badRequest()
                        .body(ATSAnalysisResponse.error("Please upload a resume or select a saved one."));
            }
            String targetRole = "Software Developer";
            List<String> jobSkills = List.of();

            if (jobId != null) {
                JobResponse job = jobService.getJobById(jobId);
                if (job != null) {
                    targetRole = job.getTitle();
                    jobSkills  = job.getSkills().stream()
                            .map(s -> (String) s.get("name"))
                            .toList();
                }
            }

            ExtractedResumeData extracted = aiService.extractAndScore(resumeText, targetRole);
            if (!extracted.isSuccess()) {
                return ResponseEntity.ok(ATSAnalysisResponse.error(extracted.getError()));
            }

            if (jobId == null && !extracted.getSuggestedRoles().isEmpty()) {
                targetRole = extracted.getSuggestedRoles().get(0);
            }

            ATSScoringService.ATSScoreResult atsResult = atsService.score(
                    extracted.getSkills(),
                    jobSkills,
                    resumeText,
                    extracted.getAiExperienceScore(),
                    extracted.getAiProjectScore()
            );

            List<String> recommendations = List.of();
            if (atsResult.atsScore < 90 && !atsResult.missingSkills.isEmpty()) {
                recommendations = aiService.generateRecommendations(
                        targetRole,
                        atsResult.missingSkills,
                        atsResult.atsScore
                );
            }

            ATSAnalysisResponse response = new ATSAnalysisResponse();
            response.setSuccess(true);
            response.setExtractedSkills(extracted.getSkills());
            response.setExperienceYears(extracted.getExperienceYears());
            response.setEducation(extracted.getEducation());
            response.setSuggestedRoles(extracted.getSuggestedRoles());
            response.setAtsScore(atsResult.atsScore);
            response.setSkillScore(atsResult.skillScore);
            response.setExperienceScore(atsResult.experienceScore);
            response.setProjectScore(atsResult.projectScore);
            response.setStrengthScore(atsResult.strengthScore);
            response.setMatchedSkills(atsResult.matchedSkills);
            response.setMissingSkills(atsResult.missingSkills);
            response.setRecommendations(recommendations);

            log.info("ATS analysis complete — score:{} role:{}", atsResult.atsScore, targetRole);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ATSAnalysisResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("ATS analysis failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ATSAnalysisResponse.error("Analysis failed. Please try again."));
        }
    }
}
