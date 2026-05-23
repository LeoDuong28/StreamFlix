package com.streamflix.streaming.controller;

import com.streamflix.common.dto.ApiResponse;
import com.streamflix.streaming.dto.StreamTokenResponse;
import com.streamflix.streaming.service.StreamingService;
import com.streamflix.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/streaming")
@RequiredArgsConstructor
public class StreamingController {

    private final StreamingService streamingService;

    @PostMapping("/token/{contentId}")
    public ResponseEntity<ApiResponse<StreamTokenResponse>> getStreamToken(
            @PathVariable Long contentId,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(ApiResponse.success(
                streamingService.generateStreamToken(contentId, user)));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(
            @RequestParam String token,
            @RequestParam Long contentId,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(ApiResponse.success(
                streamingService.validateStreamToken(token, contentId, user.getId())));
    }
}
