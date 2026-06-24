package org.eisa.nexus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthDtos() {

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password) {}

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password,
            String country,
            String countryCode) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            long expiresIn,
            String email,
            String name,
            java.util.Set<String> roles) {}

    public record MeResponse(
            String id,
            String email,
            String name,
            String country,
            String countryCode,
            java.util.Set<String> roles,
            boolean enabled) {}
}
