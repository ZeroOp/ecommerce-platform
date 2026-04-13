package com.redstore.identity.repository;

import com.redstore.identity.model.User;
import com.redstore.identity.model.UserId;
import com.redstore.common.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, UserId> {

    // Spring Data JPA magic: It writes the SQL for you based on the method name!
    Optional<User> findById_EmailAndId_Role(String email, UserRole role);

    boolean existsById_EmailAndId_Role(String email, UserRole role);

    // For backward compatibility - find any user with this email
    List<User> findById_Email(String email);

    boolean existsById_Email(String email);
}