package com.streamflix.watchlist.controller;

import com.streamflix.common.dto.ApiResponse;
import com.streamflix.common.dto.PagedResponse;
import com.streamflix.user.entity.User;
import com.streamflix.user.service.ProfileSecurityService;
import com.streamflix.watchlist.dto.WatchlistItemDto;
import com.streamflix.watchlist.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles/{profileId}/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final ProfileSecurityService profileSecurityService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<WatchlistItemDto>>> getWatchlist(
            @PathVariable Long profileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.ok(ApiResponse.success(
                watchlistService.getWatchlist(profileId, page, size)));
    }

    @PostMapping("/{contentId}")
    public ResponseEntity<ApiResponse<WatchlistItemDto>> addToWatchlist(
            @PathVariable Long profileId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Added to watchlist", watchlistService.addToWatchlist(profileId, contentId)));
    }

    @DeleteMapping("/{contentId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWatchlist(
            @PathVariable Long profileId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        watchlistService.removeFromWatchlist(profileId, contentId);
        return ResponseEntity.ok(ApiResponse.success("Removed from watchlist", null));
    }

    @GetMapping("/{contentId}/status")
    public ResponseEntity<ApiResponse<Boolean>> isInWatchlist(
            @PathVariable Long profileId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.ok(ApiResponse.success(
                watchlistService.isInWatchlist(profileId, contentId)));
    }
}
