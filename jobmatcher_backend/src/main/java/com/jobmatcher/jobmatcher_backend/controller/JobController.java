package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.JobRequest;
import com.jobmatcher.jobmatcher_backend.dto.JobResponse;
import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return new ResponseEntity<>(jobService.getAllJobs(), HttpStatus.OK);
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long jobId) {
        return new ResponseEntity<>(jobService.getJobById(jobId), HttpStatus.OK);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<JobResponse>> getRecruiterJobs(Authentication authentication) {
        String recruiterEmail = authentication.getName();
        return new ResponseEntity<>(jobService.getJobsByRecruiter(recruiterEmail), HttpStatus.OK);
    }


    @PreAuthorize("hasRole('RECRUITER')")
    @PostMapping
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest jobRequest ,
                                       Authentication authentication) {

        String recruiterEmail = authentication.getName();

        Job job =jobService.createJob(jobRequest, recruiterEmail);

        return new ResponseEntity<>(new JobResponse(job),HttpStatus.CREATED) ;

    }

    @PreAuthorize("hasRole('RECRUITER')")
    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long jobId,
                                       @Valid @RequestBody JobRequest jobRequest,
                                       Authentication authentication) {

        String recruiterEmail = authentication.getName();

        Job updatedJob = jobService.updateJob(jobId, jobRequest, recruiterEmail);

        return new ResponseEntity<>(new JobResponse(updatedJob), HttpStatus.OK);

    }

    @PreAuthorize("hasRole('RECRUITER')")
    @DeleteMapping("/{jobId}")
    public ResponseEntity<String> deleteJob(@PathVariable Long jobId, Authentication authentication) {

        String recruiterEmail = authentication.getName();

        jobService.deleteJob(jobId, recruiterEmail);

        return new ResponseEntity<>("Job deleted successfully", HttpStatus.OK);
    }


}
