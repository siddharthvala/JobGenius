package com.jobmatcher.jobmatcher_backend.repository;

import com.jobmatcher.jobmatcher_backend.model.Job;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    @EntityGraph(attributePaths = {"skills"})
    List<Job> findAll();

    @EntityGraph(attributePaths = {"skills"})
    Optional<Job> findById(Long id);

    @EntityGraph(attributePaths = {"skills"})
    @Query("SELECT j FROM Job j WHERE j.createdBy.email = :email")
    List<Job> findByRecruiterEmail(@Param("email") String email);
}
