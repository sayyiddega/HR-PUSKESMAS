package com.company.hr.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Custom CORS Filter untuk memastikan CORS headers selalu dikirim
 * Filter ini dijalankan sebelum filter lainnya untuk memastikan CORS di-handle dengan benar
 * 
 * NOTE: Filter ini di-register via FilterRegistrationBean di SecurityConfig
 * untuk memastikan dijalankan SEBELUM Spring Security filter
 */
public class CorsFilter extends OncePerRequestFilter {

    private final List<String> allowedOrigins;

    public CorsFilter(String allowedOriginsProperty) {
        // Centralized allowed origins via config: app.cors.allowed-origins
        if (allowedOriginsProperty == null || allowedOriginsProperty.isBlank()) {
            // Fallback ke default (existing behaviour) jika property tidak di-set
            this.allowedOrigins = Arrays.asList(
                    "https://tny.uctech.online",
                    "http://tny.uctech.online",
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost:8083"
            );
        } else {
            this.allowedOrigins = Arrays.stream(allowedOriginsProperty.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
    }

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
                                    @org.springframework.lang.NonNull HttpServletResponse response,
                                    @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String origin = request.getHeader("Origin");
        String method = request.getMethod();
        String path = request.getRequestURI();
        
        // Debug logging
        System.out.println("CorsFilter: " + method + " " + path + " | Origin: " + origin);
        
        // Set CORS headers untuk SEMUA origin yang diizinkan
        if (origin != null && isAllowedOrigin(origin)) {
            System.out.println("CorsFilter: Allowing origin: " + origin);
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Expose-Headers", "Authorization, Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Credentials");
            response.setHeader("Access-Control-Max-Age", "3600");
        } else if (origin != null) {
            // Debug: log origin yang tidak diizinkan
            System.out.println("CorsFilter: Origin not allowed: " + origin);
            System.out.println("CorsFilter: Allowed origins: " + allowedOrigins);
        }

        // Handle preflight OPTIONS request - return early
        if ("OPTIONS".equalsIgnoreCase(method)) {
            System.out.println("CorsFilter: Handling OPTIONS preflight");
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    private boolean isAllowedOrigin(String origin) {
        if (origin == null) {
            return false;
        }
        // Exact match atau match dengan protocol berbeda
        return allowedOrigins.stream().anyMatch(allowed -> {
            if (origin.equals(allowed)) {
                return true;
            }
            // Match http dengan https dan sebaliknya
            if (allowed.startsWith("https://") && origin.equals(allowed.replace("https://", "http://"))) {
                return true;
            }
            if (allowed.startsWith("http://") && origin.equals(allowed.replace("http://", "https://"))) {
                return true;
            }
            // Match domain tanpa protocol
            String allowedDomain = allowed.replace("https://", "").replace("http://", "");
            String originDomain = origin.replace("https://", "").replace("http://", "");
            return originDomain.equals(allowedDomain);
        });
    }
}
