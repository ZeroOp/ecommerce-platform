package com.redstore.common.dto;

import com.redstore.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleBasedLoginEventData {
    
    private String userId;
    private String email;
    private UserRole role;
    private LocalDateTime loginTime;
    private String loginSource; // "google", "email", etc.
    private String sessionId;
    
    // Role-specific fields
    private String businessName; // For sellers
    private String firstName;
    private String lastName;
    
    // Login metadata
    private String ipAddress;
    private String userAgent;
    private boolean isFirstLogin;
}
