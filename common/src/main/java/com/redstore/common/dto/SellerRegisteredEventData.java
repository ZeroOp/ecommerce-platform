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
public class SellerRegisteredEventData {
    
    private String userId;
    private String email;
    private String businessName;
    private UserRole role;
    private LocalDateTime registrationTime;
    private String registrationSource; // "google", "email", etc.
    private boolean isFirstTimeRegistration;
    
    // Additional seller-specific fields
    private String businessType;
    private String businessDescription;
    private String phone;
}
