package org.eisa.nexus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.eisa.nexus.dto.AuthDtos.AuthResponse;
import org.eisa.nexus.dto.AuthDtos.LoginRequest;
import org.eisa.nexus.dto.AuthDtos.MeResponse;
import org.eisa.nexus.dto.AuthDtos.RefreshRequest;
import org.eisa.nexus.dto.AuthDtos.RegisterRequest;
import org.eisa.nexus.entity.User;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.UserRepository;
import org.eisa.nexus.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@Tag(name = "Auth", description = "Inscription, connexion, refresh et profil utilisateur")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Operation(summary = "Créer un compte (rôle LECTEUR par défaut)")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @Operation(summary = "Authentification email/mot de passe")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @Operation(summary = "Échanger un refresh token contre un nouveau couple access/refresh")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req.refreshToken()));
    }

    @Operation(summary = "Récupérer l'utilisateur actuellement connecté", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal UserDetails principal, Authentication auth) {
        String email = principal != null ? principal.getUsername() : auth.getName();
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User " + email));
        return new MeResponse(
                u.getId(), u.getEmail(), u.getName(),
                u.getCountry(), u.getCountryCode(),
                u.getRoles().stream().map(Enum::name).collect(Collectors.toSet()),
                u.isEnabled());
    }
}
