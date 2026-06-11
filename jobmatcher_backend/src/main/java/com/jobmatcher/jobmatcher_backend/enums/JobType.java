package com.jobmatcher.jobmatcher_backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum JobType {

    FULL_TIME,
    PART_TIME,
    INTERNSHIP,
    FREELANCE,
    CONTRACT;


//  Controls how enum appears in API response

    @JsonValue
    public String toValue() {
        return this.name();
    }


     // Handles flexible input from API

    @JsonCreator
    public static JobType fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("JobType cannot be null or empty");
        }

        return Arrays.stream(JobType.values())
                .filter(type -> type.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid JobType: " + value));
    }
}