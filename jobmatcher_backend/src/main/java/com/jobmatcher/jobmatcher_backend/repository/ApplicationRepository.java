package com.jobmatcher.jobmatcher_backend.repository;

import com.jobmatcher.jobmatcher_backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobId(Long jobId);
    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);
    Optional<Application> findByCandidateIdAndJobId(Long candidateId, Long jobId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.id = :jobId")
    long countByJobId(@Param("jobId") Long jobId);

    List<Application> findBySelectedResume_Id(Long resumeId);

    List<Application> findByJobIdOrderByAtsScoreDesc(Long jobId);
    List<Application> findByJobIdOrderByAtsScoreAsc(Long jobId);
}
