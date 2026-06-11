package com.jobmatcher.jobmatcher_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/resumes}")
    private String resumeUploadDir;

    @Value("${file.profile-image-dir:uploads/profile-images}")
    private String profileImageUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path resumePath = Paths.get(resumeUploadDir).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/resumes/**")
                .addResourceLocations("file:" + resumePath + "/");

        Path profileImagePath = Paths.get(profileImageUploadDir).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/profile-images/**")
                .addResourceLocations("file:" + profileImagePath + "/");
    }
}
