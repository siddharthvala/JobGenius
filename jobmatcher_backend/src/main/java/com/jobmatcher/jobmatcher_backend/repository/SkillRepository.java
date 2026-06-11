package com.jobmatcher.jobmatcher_backend.repository;

import com.jobmatcher.jobmatcher_backend.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNameIgnoreCase(String name);

    List<Skill> findByIdIn(List<Long> ids);
}
