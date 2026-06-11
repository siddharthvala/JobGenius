package com.jobmatcher.jobmatcher_backend.controller;

import com.jobmatcher.jobmatcher_backend.dto.SkillRequest;
import com.jobmatcher.jobmatcher_backend.dto.SkillResponse;
import com.jobmatcher.jobmatcher_backend.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;


    @GetMapping
    public ResponseEntity<List<SkillResponse>>getAllSkills() {

        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping
    public ResponseEntity<List<SkillResponse>> addSkills(@Valid @RequestBody SkillRequest skillRequest ,
                                                   Authentication authentication)
    {
        String candidateEmail = authentication.getName();

        List<SkillResponse> skillResponses = skillService.addSkills(skillRequest, candidateEmail);

        return new ResponseEntity<>(skillResponses, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PutMapping
    public ResponseEntity<List<SkillResponse>> updateSkills(@Valid @RequestBody SkillRequest skillRequest ,
                                                   Authentication authentication)
    {
        String candidateEmail = authentication.getName();

        List<SkillResponse> skillResponses = skillService.updateSkills(skillRequest, candidateEmail);

        return new ResponseEntity<>(skillResponses, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @DeleteMapping("{skillId}")
    public ResponseEntity<String> deleteSkills(@Valid  @PathVariable Long skillId, Authentication authentication)
    {
        String candidateEmail = authentication.getName();

        skillService.deleteSkill(skillId,candidateEmail);

        return new ResponseEntity<>("Skill removed Successfully" , HttpStatus.OK);
    }


    //Get Skills of User

    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping("/user")

    public ResponseEntity<List<SkillResponse>> getUserSkills(Authentication authentication) {
        String candidateEmail = authentication.getName();

        List<SkillResponse> skillResponses = skillService.getUserSkills(candidateEmail);

        return ResponseEntity.ok(skillResponses);
    }



}
