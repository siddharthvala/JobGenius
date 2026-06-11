package com.jobmatcher.jobmatcher_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);  // 10s connect
        factory.setReadTimeout(30_000);     // 30s read (NIM can be slow)
        return new RestTemplate(factory);
    }
    //for ATS score
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}