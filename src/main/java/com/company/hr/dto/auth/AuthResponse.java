package com.company.hr.dto.auth;

import com.company.hr.entity.auth.Role;

public record AuthResponse(
        String tokenType,
        String accessToken,
        String email,
        Role role
) {
    public static AuthResponse bearer(String token, String email, Role role) {
        return new AuthResponse("Bearer", token, email, role);
    }
}

