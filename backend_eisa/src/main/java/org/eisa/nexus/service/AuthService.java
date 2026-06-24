package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.dto.AuthDtos.AuthResponse;
import org.eisa.nexus.dto.AuthDtos.LoginRequest;
import org.eisa.nexus.dto.AuthDtos.RegisterRequest;
import org.eisa.nexus.entity.Role;
import org.eisa.nexus.entity.User;
import org.eisa.nexus.exception.ConflictException;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.UserRepository;
import org.eisa.nexus.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email().toLowerCase())) {
            throw new ConflictException("Email already registered");
        }
        User user = User.builder()
                .name(req.name())
                .email(req.email().toLowerCase())
                .password(passwordEncoder.encode(req.password()))
                .country(req.country())
                .countryCode(req.countryCode())
                .roles(EnumSet.of(Role.LECTEUR))
                .enabled(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        userRepository.save(user);
        return tokensFor(user);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().toLowerCase(), req.password()));
        User user = userRepository.findByEmail(req.email().toLowerCase()).orElseThrow();
        return tokensFor(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        String email = jwtService.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User " + email));
        if (!user.isEnabled()) throw new BadCredentialsException("User disabled");
        return tokensFor(user);
    }

    private AuthResponse tokensFor(User user) {
        List<String> roles = user.getRoles().stream().map(Enum::name).toList();
        String access = jwtService.generateAccessToken(user.getEmail(), roles);
        String refresh = jwtService.generateRefreshToken(user.getEmail());
        return new AuthResponse(
                access,
                refresh,
                "Bearer",
                jwtService.getAccessExpirationMs() / 1000,
                user.getEmail(),
                user.getName(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()));
    }
}
