package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.model.Skill;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String companyName;
    private String location;
    private String jobType;
    private String workMode;
    private Integer salary;
    private Integer experienceRequired;

    private LocalDate postedDate;
    private LocalDate lastDateToApply;
    private Long recruiterId;

    private List<Map<String, Object>> skills;
    private long applicationCount;
    private String status;

    public JobResponse(Job job) {
        this.id = job.getId();
        this.title = job.getTitle();
        this.companyName = job.getCompanyName();
        this.location = job.getLocation();
        this.jobType = job.getJobType().name();
        this.workMode = job.getWorkMode().name();
        this.salary = job.getSalary();
        this.experienceRequired = job.getExperienceRequired();
        this.postedDate = job.getPostedDate();
        this.lastDateToApply = job.getLastDateToApply();

        this.recruiterId = job.getCreatedBy().getId();

        this.skills = job.getSkills() != null
                ? job.getSkills().stream()
                        .map(s -> Map.<String, Object>of("id", s.getId(), "name", s.getName()))
                        .toList()
                : List.of();

        this.status = (job.getLastDateToApply() != null && job.getLastDateToApply().isBefore(LocalDate.now()))
                ? "CLOSED" : "ACTIVE";
    }

}
