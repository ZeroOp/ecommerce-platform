package com.redstore.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginEventData {
    private String userId;
    private String email;
    private String loginTime;
    private String ipAddress;
}