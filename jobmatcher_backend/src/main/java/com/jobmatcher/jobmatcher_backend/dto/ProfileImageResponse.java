package com.jobmatcher.jobmatcher_backend.dto;

import com.jobmatcher.jobmatcher_backend.model.User;
import lombok.Getter;

@Getter
public class ProfileImageResponse {

    private final Long userId;
    private final String profileImageUrl;
    private final String profileImageFileName;

    public ProfileImageResponse(User user) {
        this.userId = user.getId();
        this.profileImageUrl = user.getProfileImageUrl();
        this.profileImageFileName = user.getProfileImageFileName();
    }
}
