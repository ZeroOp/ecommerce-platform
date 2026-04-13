package com.redstore.common.dto;

import java.time.LocalDateTime;

public class UserLogoutEventData {
    private String email;
    private String role;
    private LocalDateTime timestamp;

    public UserLogoutEventData() {}

    public UserLogoutEventData(String email, String role) {
        this.email = email;
        this.role = role;
        this.timestamp = LocalDateTime.now();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
