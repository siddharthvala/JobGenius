package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.ResumeResponse;
import com.jobmatcher.jobmatcher_backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        ResumeResponse response = resumeService.uploadResume(file, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping("/my")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(Authentication authentication) {
        List<ResumeResponse> resumes = resumeService.getMyResumes(authentication.getName());
        return ResponseEntity.ok(resumes);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PutMapping("/{resumeId}/primary")
    public ResponseEntity<ResumeResponse> setPrimary(
            @PathVariable Long resumeId,
            Authentication authentication) {

        ResumeResponse response = resumeService.setPrimary(resumeId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<String> deleteResume(
            @PathVariable Long resumeId,
            Authentication authentication) {

        resumeService.deleteResume(resumeId, authentication.getName());
        return ResponseEntity.ok("Resume deleted successfully");
    }
}
