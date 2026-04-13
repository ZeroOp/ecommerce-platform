package com.redstore.identity.model;

import com.redstore.common.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class User {

    @EmbeddedId
    private UserId id;

    @Column(nullable = false)
    private String password;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Convenience getters for email and role
    public String getEmail() {
        return id != null ? id.getEmail() : null;
    }

    public UserRole getRole() {
        return id != null ? id.getRole() : null;
    }

    public void setEmail(String email) {
        if (id == null) {
            id = new UserId();
        }
        id.setEmail(email);
    }

    public void setRole(UserRole role) {
        if (id == null) {
            id = new UserId();
        }
        id.setRole(role);
    }
}