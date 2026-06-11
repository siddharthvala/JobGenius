package com.jobmatcher.jobmatcher_backend.controller;


import com.jobmatcher.jobmatcher_backend.dto.JobMatchResponse;
import com.jobmatcher.jobmatcher_backend.service.JobMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jobmatch")
@RequiredArgsConstructor
public class JobMatchingController {

    @Autowired
    private JobMatchingService jobMatchingService;


    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping("/match")
    public ResponseEntity<List<JobMatchResponse>> getJobMatches(Authentication authentication) {
        String candidateEmail = authentication.getName();

        List<JobMatchResponse> matches = jobMatchingService.getJobMatchesForCandidate(candidateEmail);

        return ResponseEntity.ok(matches);
    }

}
