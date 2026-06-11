package com.jobmatcher.jobmatcher_backend.model;

import com.jobmatcher.jobmatcher_backend.enums.RoleEnum;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    @Column(unique = true)
    private String email;
    @Enumerated(EnumType.STRING)
    private RoleEnum role; // Role =  Candidate, Recruiter

    @ManyToMany
    @JoinTable(
            name = "user_skills",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skills;

    private String resumeUrl;
    private String resumeFileName;
    private LocalDateTime resumeUploadedAt;

    private String phone;
    private String location;
    private String education;

    @Column(columnDefinition = "TEXT")
    private String aboutMe;

    private String profileImageUrl;
    private String profileImageFileName;
}
