package com.jobmatcher.jobmatcher_backend.enums;

public enum RoleEnum {

    RECRUITER,
    CANDIDATE;

    public String getAuthority() {
        return name();
    }
}