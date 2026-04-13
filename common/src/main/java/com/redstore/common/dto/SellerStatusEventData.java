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
public class SellerStatusEventData {
    
    private String userId;
    private String email;
    private String businessName;
    private UserRole role;
    private LocalDateTime statusChangeTime;
    private String previousStatus;
    private String newStatus;
    private String reason; // For rejection or approval
    private String changedBy; // Admin who made the change
    
    // Additional seller information
    private String businessType;
    private String phone;
}
