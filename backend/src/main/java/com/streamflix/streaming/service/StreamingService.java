package com.streamflix.streaming.service;

import com.streamflix.common.exception.BusinessException;
import com.streamflix.common.exception.ForbiddenException;
import com.streamflix.common.exception.ResourceNotFoundException;
import com.streamflix.content.entity.Content;
import com.streamflix.content.repository.ContentRepository;
import com.streamflix.streaming.dto.StreamTokenResponse;
import com.streamflix.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreamingService {

    private final ContentRepository contentRepository;
    private final StringRedisTemplate redisTemplate;

    @Value("${app.streaming.token-secret}")
    private String tokenSecret;

    @Value("${app.streaming.token-ttl-minutes:30}")
    private int tokenTtlMinutes;

    @PostConstruct
    void validateConfig() {
        if (tokenSecret == null || tokenSecret.length() < 32) {
            throw new IllegalStateException("app.streaming.token-secret must be at least 32 characters");
        }
    }

    // Sample HLS streams for demo purposes
    private static final String[] SAMPLE_STREAMS = {
            "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
            "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8"
    };

    @Transactional(readOnly = true) // JPA read-only; Redis writes are outside this transaction
    public StreamTokenResponse generateStreamToken(Long contentId, User user) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + contentId));

        // Check premium access
        if (Boolean.TRUE.equals(content.getIsPremium())) {
            boolean hasPremiumAccess = user.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_PREMIUM".equals(a.getAuthority()) || "ROLE_ADMIN".equals(a.getAuthority()));
            if (!hasPremiumAccess) {
                throw new ForbiddenException("Premium subscription required to stream this content");
            }
        }

        if (content.getVideoUrl() == null || content.getVideoUrl().isBlank()) {
            // Assign a sample stream based on content ID for demo consistency
            String sampleStream = SAMPLE_STREAMS[(int) (contentId % SAMPLE_STREAMS.length)];
            return buildStreamResponse(contentId, user.getId(), sampleStream);
        }

        return buildStreamResponse(contentId, user.getId(), content.getVideoUrl());
    }

    public boolean validateStreamToken(String token, Long contentId, Long userId) {
        String redisKey = "stream:token:" + token;
        String storedValue = redisTemplate.opsForValue().get(redisKey);
        if (storedValue == null) return false;
        String expected = contentId + ":" + userId;
        return expected.equals(storedValue);
    }

    private StreamTokenResponse buildStreamResponse(Long contentId, Long userId, String streamUrl) {
        String token = generateToken(contentId, userId);
        long expiresAt = System.currentTimeMillis() + (long) tokenTtlMinutes * 60 * 1000;

        // Store token in Redis with TTL (contentId:userId for user-binding)
        String redisKey = "stream:token:" + token;
        redisTemplate.opsForValue().set(redisKey, contentId + ":" + userId, Duration.ofMinutes(tokenTtlMinutes));

        log.info("Stream token generated for content {} by user {}", contentId, userId);

        return StreamTokenResponse.builder()
                .streamUrl(streamUrl)
                .token(token)
                .expiresAt(expiresAt)
                .build();
    }

    private String generateToken(Long contentId, Long userId) {
        String payload = contentId + ":" + userId + ":" + UUID.randomUUID();
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new BusinessException("Failed to generate stream token");
        }
    }
}
