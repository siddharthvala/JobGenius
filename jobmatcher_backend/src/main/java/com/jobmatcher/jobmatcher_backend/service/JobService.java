package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.JobRequest;
import com.jobmatcher.jobmatcher_backend.dto.JobResponse;
import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.ApplicationRepository;
import com.jobmatcher.jobmatcher_backend.repository.JobRepository;
import com.jobmatcher.jobmatcher_backend.repository.SkillRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

@Service
@Transactional
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public List<JobResponse> getJobsByRecruiter(String recruiterEmail) {
        return jobRepository.findByRecruiterEmail(recruiterEmail)
                .stream()
                .map(job -> {
                    JobResponse res = new JobResponse(job);
                    res.setApplicationCount(applicationRepository.countByJobId(job.getId()));
                    return res;
                })
                .toList();
    }

    public List<JobResponse> getAllJobs() {
        LocalDate today = LocalDate.now();
        return jobRepository.findAll()
                .stream()
                .filter(job -> job.getLastDateToApply() != null && !job.getLastDateToApply().isBefore(today))
                .map(JobResponse::new)
                .toList();
    }

    public JobResponse getJobById(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
        return new JobResponse(job);
    }

    public Job createJob(JobRequest jobRequest, String recruiterEmail) {

        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found with email: " + recruiterEmail));

        Job job = new Job();
        job.setTitle(jobRequest.getTitle());
        job.setDescription(jobRequest.getDescription());
        job.setLocation(jobRequest.getLocation());
        job.setSalary(jobRequest.getSalary());
        job.setJobType(jobRequest.getJobType());
        job.setCompanyName(jobRequest.getCompanyName());
        job.setExperienceRequired(jobRequest.getExperienceRequired());
        job.setWorkMode(jobRequest.getWorkMode());
        job.setCreatedBy(recruiter);
        job.setPostedDate(LocalDate.now());
        job.setLastDateToApply(jobRequest.getLastDateToApply());
        
        // Convert List to Set for skills
        if (jobRequest.getSkillIds() != null && !jobRequest.getSkillIds().isEmpty()) {

            var skills = skillRepository.findAllById(jobRequest.getSkillIds());

            if (skills.size() != jobRequest.getSkillIds().size()) {
                throw new RuntimeException("Some skill IDs are invalid");
            }

            job.setSkills(new HashSet<>(skills));
        }

        return jobRepository.save(job);
    }

    public Job updateJob(Long jobId, @Valid JobRequest jobRequest, String recruiterEmail) {



        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (!job.getCreatedBy().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Recruiter Unauthorized to update this job");
        }

        job.setTitle(jobRequest.getTitle());
        job.setDescription(jobRequest.getDescription());
        job.setLocation(jobRequest.getLocation());
        job.setCompanyName(jobRequest.getCompanyName());
        job.setExperienceRequired(jobRequest.getExperienceRequired());
        job.setJobType(jobRequest.getJobType());
        job.setWorkMode(jobRequest.getWorkMode());
        job.setSalary(jobRequest.getSalary());
        job.setLastDateToApply(jobRequest.getLastDateToApply());

        if (jobRequest.getSkillIds() != null) {
            job.setSkills(new HashSet<>(skillRepository.findAllById(jobRequest.getSkillIds())));
        }

        return jobRepository.save(job);

    }

    public void deleteJob(Long jobId, String recruiterEmail) {



        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (!job.getCreatedBy().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Recruiter Unauthorized to delete this job");
        }

        jobRepository.delete(job);
    }


}
