package com.jobmatcher.jobmatcher_backend.model;

import com.jobmatcher.jobmatcher_backend.enums.JobType;
import com.jobmatcher.jobmatcher_backend.enums.WorkMode;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private JobType jobType;
    @Column(nullable = false)
    @NotBlank
    private String location;
    @Column(nullable = false)
    @NotBlank
    private String companyName;
    @Min(0)
    private Integer experienceRequired;
    @Enumerated(EnumType.STRING)
    private WorkMode workMode;
    @Min(0)
    private Integer salary;

    private LocalDate postedDate;
    private LocalDate lastDateToApply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy; //recruiter who created the job posting

    // Skills for matching
    @ManyToMany
    @JoinTable(
            name = "job_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skills;
}