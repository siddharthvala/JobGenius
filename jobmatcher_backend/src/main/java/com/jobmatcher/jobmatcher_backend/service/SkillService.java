package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.SkillRequest;
import com.jobmatcher.jobmatcher_backend.dto.SkillResponse;
import com.jobmatcher.jobmatcher_backend.enums.RoleEnum;
import com.jobmatcher.jobmatcher_backend.model.Skill;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.SkillRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserRepository userRepository;

    public List<SkillResponse> getAllSkills() {

        return skillRepository.findAll().stream()
                .map(skill -> new SkillResponse(skill.getId(), skill.getName()))
                .toList();
    }


    public List<SkillResponse> addSkills(@Valid SkillRequest skillRequest, String candidateEmail) {

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found with email: " + candidateEmail));

        if (candidate.getRole() != RoleEnum.CANDIDATE) {
            throw new RuntimeException("Only candidates can add skills");
        }
        List<Skill> skills = skillRepository.findByIdIn(skillRequest.getSkillIds());


        if (skills.size() != skillRequest.getSkillIds().size()) {
            throw new RuntimeException("Some skill IDs are invalid");
        }

        candidate.getSkills().addAll(skills);
        userRepository.save(candidate);

        return candidate.getSkills().stream()
                .map(skill -> new SkillResponse(skill.getId(), skill.getName()))
                .toList();

    }

    public List<SkillResponse> updateSkills(@Valid SkillRequest skillRequest, String candidateEmail) {

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found with email: " + candidateEmail));

        if (candidate.getRole() != RoleEnum.CANDIDATE) {
            throw new RuntimeException("Only candidates can update skills");
        }

        List<Skill> skills = skillRepository.findByIdIn(skillRequest.getSkillIds());

        if (skills.size() != skillRequest.getSkillIds().size()) {
            throw new RuntimeException("Some skill IDs are invalid");
        }

        candidate.setSkills(skills.stream().collect(java.util.stream.Collectors.toSet()));
        userRepository.save(candidate);

        return candidate.getSkills().stream()
                .map(skill -> new SkillResponse(skill.getId(), skill.getName()))
                .toList();
    }

    public void deleteSkill(@Valid Long skillId, String candidateEmail) {

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found with email: " + candidateEmail));

        if (candidate.getRole() != RoleEnum.CANDIDATE) {
            throw new RuntimeException("Only candidates can delete skills");
        }

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found with id: " + skillId));

        candidate.getSkills().remove(skill);
        userRepository.save(candidate);

    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getUserSkills(String candidateEmail) {

        User Candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found with email: " + candidateEmail));

        if (Candidate.getRole() != RoleEnum.CANDIDATE) {
            throw new RuntimeException("Only candidates can view their skills");
        }

        return Candidate.getSkills().stream()
                .map(skill -> new SkillResponse(skill.getId(), skill.getName()))
                .toList();
    }
}