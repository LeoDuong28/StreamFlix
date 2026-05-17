package com.streamflix.auth.service;

import com.streamflix.auth.dto.AuthResponse;
import com.streamflix.auth.dto.LoginRequest;
import com.streamflix.auth.dto.RegisterRequest;
import com.streamflix.common.exception.BusinessException;
import com.streamflix.common.exception.DuplicateResourceException;
import com.streamflix.common.exception.UnauthorizedException;
import com.streamflix.user.entity.Profile;
import com.streamflix.user.entity.Role;
import com.streamflix.user.entity.User;
import com.streamflix.user.repository.ProfileRepository;
import com.streamflix.user.repository.RoleRepository;
import com.streamflix.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final StringRedisTemplate redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String LOGIN_ATTEMPTS_PREFIX = "login:attempts:";
    private static final String LOGIN_LOCKED_PREFIX = "login:locked:";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(15);

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        Role userRole = roleRepository.findByName(Role.USER)
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        user.addRole(userRole);

        user = userRepository.save(user);

        Profile defaultProfile = Profile.builder()
                .user(user)
                .name(user.getFullName())
                .build();
        profileRepository.save(defaultProfile);

        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail();

        // Check account lockout
        if (Boolean.TRUE.equals(redisTemplate.hasKey(LOGIN_LOCKED_PREFIX + email))) {
            throw new BusinessException("Account temporarily locked due to too many failed attempts. Try again later.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException e) {
            handleFailedLogin(email);
            throw new UnauthorizedException("Invalid credentials");
        }

        // Clear failed attempts on success
        redisTemplate.delete(LOGIN_ATTEMPTS_PREFIX + email);

        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        log.info("User logged in: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    private void handleFailedLogin(String email) {
        String key = LOGIN_ATTEMPTS_PREFIX + email;
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, LOCKOUT_DURATION);
        }
        if (attempts != null && attempts >= MAX_LOGIN_ATTEMPTS) {
            redisTemplate.opsForValue().set(LOGIN_LOCKED_PREFIX + email, "true", LOCKOUT_DURATION);
            log.warn("Account locked due to {} failed login attempts: {}", attempts, email);
        }
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        String username;
        try {
            username = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findByEmailWithRoles(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        // Atomic check-and-delete: prevents token reuse
        String redisKey = REFRESH_TOKEN_PREFIX + username;
        String storedToken = redisTemplate.opsForValue().getAndDelete(redisKey);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        return buildAuthResponse(user);
    }

    public void logout(String username) {
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + username);
        log.info("User logged out: {}", username);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Store new refresh token in Redis for revocation support
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.getEmail(),
                refreshToken,
                7, TimeUnit.DAYS
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .build();
    }
}
