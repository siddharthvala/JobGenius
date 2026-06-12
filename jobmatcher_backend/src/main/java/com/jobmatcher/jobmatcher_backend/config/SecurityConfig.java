package com.jobmatcher.jobmatcher_backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private  UserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    //  Authentication Provider
    @Bean
    public AuthenticationProvider authProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
        return provider;
    }

    //  Security Rules
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())  
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        //  ALLOW AUTH APIs (VERY IMPORTANT)
                        .requestMatchers("/auth/**").permitAll()
                        // ALLOW Public jobs
                        .requestMatchers(HttpMethod.GET, "/jobs").permitAll()
                        // Recruiter's own jobs
                        .requestMatchers(HttpMethod.GET, "/jobs/recruiter").hasRole("RECRUITER")
                        //  Job detail — recruiters and candidates can view
                        .requestMatchers(HttpMethod.GET, "/jobs/**").hasAnyRole("RECRUITER", "CANDIDATE")
                        .requestMatchers(HttpMethod.POST, "/jobs").hasRole("RECRUITER")
                        .requestMatchers(HttpMethod.PUT, "/jobs/**").hasRole("RECRUITER")
                        .requestMatchers(HttpMethod.DELETE, "/jobs/**").hasRole("RECRUITER")

                        .requestMatchers(HttpMethod.POST, "/api/ai/**").permitAll()
                        // User profile, password, image
                        .requestMatchers("/users/**").authenticated()

                        // Applications — role enforcement handled by @PreAuthorize on controller
                        .requestMatchers("/applications/**").authenticated()

                        // Notifications
                        .requestMatchers("/notifications/**").authenticated()

                        // Resume — upload/delete restricted to CANDIDATE via @PreAuthorize
                        .requestMatchers("/resume/**").authenticated()
                        // Serve uploaded files publicly (direct link access)
                        .requestMatchers("/uploads/resumes/**").permitAll()
                        .requestMatchers("/uploads/profile-images/**").permitAll()
                        //AI intergration
                        .requestMatchers("/api/ai/**").authenticated()

                        .requestMatchers("/api/resume/**").authenticated()

                        //  Everything else
                        .anyRequest().authenticated()

                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
        public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "https://job-genius-seven.vercel.app"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
        }

    // ✅ Authentication Manager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}