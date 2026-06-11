package com.jobmatcher.jobmatcher_backend.repository;

import com.jobmatcher.jobmatcher_backend.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUser_IdOrderByUploadedAtAsc(Long userId);

    long countByUser_Id(Long userId);

    Optional<Resume> findByUser_IdAndPrimaryTrue(Long userId);
}
