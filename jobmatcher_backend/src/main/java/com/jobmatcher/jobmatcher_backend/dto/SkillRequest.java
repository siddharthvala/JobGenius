package com.jobmatcher.jobmatcher_backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SkillRequest {
    private List<Long> skillIds;
}
