package com.jobmatcher.jobmatcher_backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum WorkMode {

    REMOTE,
    OFFICE,
    HYBRID;

    @JsonValue
    public String toValue() {
        return this.name();
    }
    @JsonCreator
    public static WorkMode fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("WorkMode cannot be null or empty");
        }

        return Arrays.stream(WorkMode.values())
                .filter(mode -> mode.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid WorkMode: " + value));
    }
}