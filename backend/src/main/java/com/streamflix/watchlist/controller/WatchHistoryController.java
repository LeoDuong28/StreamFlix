package com.streamflix.watchlist.controller;

import com.streamflix.common.dto.ApiResponse;
import com.streamflix.user.entity.User;
import com.streamflix.user.service.ProfileSecurityService;
import com.streamflix.watchlist.dto.ProgressUpdateRequest;
import com.streamflix.watchlist.dto.WatchHistoryDto;
import com.streamflix.watchlist.service.WatchHistoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profiles/{profileId}/history")
@RequiredArgsConstructor
@Validated
public class WatchHistoryController {

    private final WatchHistoryService watchHistoryService;
    private final ProfileSecurityService profileSecurityService;

    @PostMapping("/progress")
    public ResponseEntity<ApiResponse<WatchHistoryDto>> updateProgress(
            @PathVariable Long profileId,
            @Valid @RequestBody ProgressUpdateRequest request,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.ok(ApiResponse.success(
                watchHistoryService.updateProgress(profileId, request)));
    }

    @GetMapping("/continue-watching")
    public ResponseEntity<ApiResponse<List<WatchHistoryDto>>> getContinueWatching(
            @PathVariable Long profileId,
            @RequestParam(defaultValue = "20") @Positive @Max(50) int limit,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.ok(ApiResponse.success(
                watchHistoryService.getContinueWatching(profileId, limit)));
    }

    @GetMapping("/recently-watched")
    public ResponseEntity<ApiResponse<List<WatchHistoryDto>>> getRecentlyWatched(
            @PathVariable Long profileId,
            @RequestParam(defaultValue = "20") @Positive @Max(50) int limit,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.ok(ApiResponse.success(
                watchHistoryService.getRecentlyWatched(profileId, limit)));
    }
}
