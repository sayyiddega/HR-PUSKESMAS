package com.company.hr.service.auth;

import com.company.hr.dto.auth.LoginRequest;
import com.company.hr.dto.auth.RegisterRequest;
import com.company.hr.entity.auth.UserAccount;
import com.company.hr.repository.auth.UserAccountRepository;
import com.company.hr.web.exception.ConflictException;
import com.company.hr.web.exception.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserAccount register(RegisterRequest req) {
        if (userAccountRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already registered");
        }
        String hash = passwordEncoder.encode(req.password());
        UserAccount user = new UserAccount(req.email().trim().toLowerCase(), hash);
        return userAccountRepository.save(user);
    }

    public UserAccount validateLogin(LoginRequest req) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return user;
    }
}

