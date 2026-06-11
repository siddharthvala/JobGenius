package com.jobmatcher.jobmatcher_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.jobmatcher.jobmatcher_backend.model.User;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);


    //  query to fetch user with skills
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.skills WHERE u.email = :email")
    Optional<User> findByEmailWithSkills(@Param("email") String email);
}
