package com.jobmatcher.jobmatcher_backend.service;

import com.jobmatcher.jobmatcher_backend.dto.JobMatchResponse;
import com.jobmatcher.jobmatcher_backend.model.Job;
import com.jobmatcher.jobmatcher_backend.model.Skill;
import com.jobmatcher.jobmatcher_backend.model.User;
import com.jobmatcher.jobmatcher_backend.repository.JobRepository;
import com.jobmatcher.jobmatcher_backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class JobMatchingService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private JobRepository jobRepository;

        public List<JobMatchResponse> getJobMatchesForCandidate(String candidateEmail) {

            try{
                User candidate = userRepository.findByEmailWithSkills(candidateEmail)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                //fetch candidate skills
                Set<String> candidateSkills = candidate.getSkills().stream()
                        .map(skill -> skill.getName().toLowerCase())
                        .collect(Collectors.toSet());

//                System.out.println("User Skills: " + candidate.getSkills());
                //get all jobs
                List<Job> jobs  = jobRepository.findAll();

                if(jobs.isEmpty()) {
                    return List.of();
                }


                //Process matching jobs
                List<JobMatchResponse> responseList = jobs.stream().map(job->{

                            List<String> jobSkills = Optional.ofNullable(job.getSkills())
                                    .orElse(Set.of())
                                    .stream()
                                    .map(skill -> skill.getName().toLowerCase())
                                    .toList();

                            List<String> matched = jobSkills.stream()
                                    .filter(candidateSkills::contains)
                                    .toList();

                            List<String> missing = jobSkills.stream()
                                    .filter(skill -> !candidateSkills.contains(skill))
                                    .toList();

                    int matchPercentage = jobSkills.isEmpty()
                            ? 0
                            : (matched.size() * 100) / jobSkills.size();

                    return new JobMatchResponse(
                            job.getId(),
                            job.getTitle(),
                            job.getCompanyName(),
                            matchPercentage,
                            matched,
                            missing
                    );

                }).sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()))
                        .toList();

                return responseList;

            }
            catch (Exception ex) {
                throw new RuntimeException("Error while matching jobs: " + ex.getMessage());
            }
    }
}
