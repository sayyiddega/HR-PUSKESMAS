package com.company.hr.controller.auth;

import com.company.hr.dto.auth.AuthResponse;
import com.company.hr.dto.auth.LoginRequest;
import com.company.hr.dto.auth.RegisterRequest;
import com.company.hr.entity.auth.UserAccount;
import com.company.hr.security.JwtService;
import com.company.hr.security.TokenBlacklistService;
import com.company.hr.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthController(AuthService authService, JwtService jwtService, TokenBlacklistService tokenBlacklistService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<MapResponse> register(@Valid @RequestBody RegisterRequest req) {
        UserAccount user = authService.register(req);
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(MapResponse.of(AuthResponse.bearer(token, user.getEmail(), user.getRole())));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user and return JWT access token")
    public ResponseEntity<MapResponse> login(@Valid @RequestBody LoginRequest req) {
        UserAccount user = authService.validateLogin(req);
        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(MapResponse.of(AuthResponse.bearer(token, user.getEmail(), user.getRole())));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user (blacklist current token)")
    public ResponseEntity<MapResponse> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring("Bearer ".length()).trim();
            tokenBlacklistService.blacklistToken(token);
        }
        return ResponseEntity.ok(MapResponse.of(Map.of("message", "Logout successful")));
    }

    public record MapResponse(Object data) {
        public static MapResponse of(Object data) {
            return new MapResponse(data);
        }
    }
}

