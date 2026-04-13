package com.redstore.common.dto;

import com.redstore.common.enums.UserRole; // Import our new Enum
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPayload {

    @NotBlank(message = "ID is required")
    private String id;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotEmpty(message = "At least one role is required")
    private Set<UserRole> roles; // Changed from String to UserRole

    public String getRole() {
        return roles != null && !roles.isEmpty() ? roles.iterator().next().name() : null;
    }
}