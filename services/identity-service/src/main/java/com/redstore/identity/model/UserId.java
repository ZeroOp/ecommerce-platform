package com.redstore.identity.model;

import com.redstore.common.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Enumerated;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserId implements Serializable {

    @Column(name = "email", nullable = false)
    private String email;

    @Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;
}
