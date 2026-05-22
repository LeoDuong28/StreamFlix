package com.streamflix.rating.controller;

import com.streamflix.common.dto.ApiResponse;
import com.streamflix.rating.dto.RateRequest;
import com.streamflix.rating.dto.RatingDto;
import com.streamflix.rating.service.RatingService;
import com.streamflix.user.entity.User;
import com.streamflix.user.service.ProfileSecurityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles/{profileId}/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final ProfileSecurityService profileSecurityService;

    @PostMapping
    public ResponseEntity<ApiResponse<RatingDto>> rateContent(
            @PathVariable Long profileId,
            @Valid @RequestBody RateRequest request,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.ok(ApiResponse.success(
                ratingService.rateContent(profileId, request)));
    }

    @GetMapping("/{contentId}")
    public ResponseEntity<ApiResponse<RatingDto>> getRating(
            @PathVariable Long profileId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        return ResponseEntity.ok(ApiResponse.success(
                ratingService.getRating(profileId, contentId)));
    }

    @DeleteMapping("/{contentId}")
    public ResponseEntity<ApiResponse<Void>> deleteRating(
            @PathVariable Long profileId,
            @PathVariable Long contentId,
            @AuthenticationPrincipal User user) {

        profileSecurityService.validateOwnership(profileId, user);
        ratingService.deleteRating(profileId, contentId);
        return ResponseEntity.ok(ApiResponse.success("Rating deleted", null));
    }
}
