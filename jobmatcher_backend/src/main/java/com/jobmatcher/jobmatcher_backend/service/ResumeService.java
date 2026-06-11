package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {

    ResumeResponse uploadResume(MultipartFile file, String candidateEmail);

    List<ResumeResponse> getMyResumes(String candidateEmail);

    ResumeResponse setPrimary(Long resumeId, String candidateEmail);

    void deleteResume(Long resumeId, String candidateEmail);
}
