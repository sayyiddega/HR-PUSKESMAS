package com.company.hr.security;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public void blacklistToken(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    // Optional: cleanup expired tokens periodically (bisa ditambahkan scheduled task)
    public void removeToken(String token) {
        blacklistedTokens.remove(token);
    }

    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }
}
