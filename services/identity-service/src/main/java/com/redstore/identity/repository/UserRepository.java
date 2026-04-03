package com.redstore.identity.repository;

import com.redstore.identity.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA magic: It writes the SQL for you based on the method name!
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}