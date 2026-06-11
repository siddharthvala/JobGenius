package com.jobmatcher.jobmatcher_backend.service.impl;

import com.jobmatcher.jobmatcher_backend.dto.ResumeResponse;
import com.jobmatcher.jobmatcher_backend.model.Resume;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.ApplicationRepository;
import com.jobmatcher.jobmatcher_backend.repository.ResumeRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import com.jobmatcher.jobmatcher_backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResumeServiceImpl implements ResumeService {

    private static final int MAX_RESUMES = 3;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".pdf", ".doc", ".docx");

    @Value("${file.upload-dir:uploads/resumes}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Override
    @Transactional
    public ResumeResponse uploadResume(MultipartFile file, String candidateEmail) {
        validateFile(file);

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        long count = resumeRepository.countByUser_Id(candidate.getId());
        if (count >= MAX_RESUMES) {
            throw new RuntimeException("Maximum of " + MAX_RESUMES + " resumes allowed. Please delete one before uploading.");
        }

        String originalFileName = file.getOriginalFilename();
        String storedFileName = storeFile(file);
        String resumeUrl = baseUrl + "/uploads/resumes/" + storedFileName;

        Resume resume = new Resume();
        resume.setUser(candidate);
        resume.setOriginalFileName(originalFileName);
        resume.setStoredFileName(storedFileName);
        resume.setResumeUrl(resumeUrl);
        resume.setPrimary(count == 0); // first upload becomes primary
        resume.setUploadedAt(LocalDateTime.now());

        resumeRepository.save(resume);
        return new ResumeResponse(resume);
    }

    @Override
    public List<ResumeResponse> getMyResumes(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        return resumeRepository.findByUser_IdOrderByUploadedAtAsc(candidate.getId())
                .stream()
                .map(ResumeResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResumeResponse setPrimary(Long resumeId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        Resume target = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (!target.getUser().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized: This resume does not belong to you");
        }

        // Unset primary on all resumes for this user
        List<Resume> allResumes = resumeRepository.findByUser_IdOrderByUploadedAtAsc(candidate.getId());
        allResumes.forEach(r -> r.setPrimary(false));
        resumeRepository.saveAll(allResumes);

        target.setPrimary(true);
        resumeRepository.save(target);

        return new ResumeResponse(target);
    }

    @Override
    @Transactional
    public void deleteResume(Long resumeId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (!resume.getUser().getId().equals(candidate.getId())) {
            throw new RuntimeException("Unauthorized: This resume does not belong to you");
        }

        boolean wasPrimary = resume.isPrimary();

        // Null out FK on any applications that referenced this resume
        applicationRepository.findBySelectedResume_Id(resumeId)
                .forEach(app -> app.setSelectedResume(null));
        applicationRepository.flush();

        deleteFileFromDisk(resume.getStoredFileName());
        resumeRepository.delete(resume);

        // Promote the oldest remaining resume to primary if deleted one was primary
        if (wasPrimary) {
            List<Resume> remaining = resumeRepository.findByUser_IdOrderByUploadedAtAsc(candidate.getId());
            if (!remaining.isEmpty()) {
                remaining.get(0).setPrimary(true);
                resumeRepository.save(remaining.get(0));
            }
        }
    }

    // ── Private helpers ────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum allowed limit of 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new RuntimeException("Invalid file type. Only PDF, DOC, and DOCX files are allowed");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("File name must not be empty");
        }
        String lowerName = originalName.toLowerCase();
        boolean hasValidExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
        if (!hasValidExtension) {
            throw new RuntimeException("Invalid file extension. Only .pdf, .doc, .docx are allowed");
        }
    }

    private String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename();
            String extension = originalName.substring(originalName.lastIndexOf('.'));
            String uniqueFileName = UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file: " + ex.getMessage());
        }
    }

    private void deleteFileFromDisk(String storedFileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(storedFileName);
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // non-critical — log in production
        }
    }
}
