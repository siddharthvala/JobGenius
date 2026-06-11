package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.enums.JobType;
import com.jobmatcher.jobmatcher_backend.enums.WorkMode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/enums")
public class EnumController {

    // ── Job Types ─────────────────────────────
    @GetMapping("/job-types")
    public ResponseEntity<List<String>> getJobTypes() {
        List<String> jobTypes = Arrays.stream(JobType.values())
                .map(Enum::name)
                .toList();

        return ResponseEntity.ok(jobTypes);
    }

    // ── Work Modes ────────────────────────────
    @GetMapping("/work-modes")
    public ResponseEntity<List<String>> getWorkModes() {
        List<String> workModes = Arrays.stream(WorkMode.values())
                .map(WorkMode::name)
                .toList();

        return ResponseEntity.ok(workModes);
    }
}