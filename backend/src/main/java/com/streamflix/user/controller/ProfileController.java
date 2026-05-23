package com.streamflix.user.controller;

import com.streamflix.common.dto.ApiResponse;
import com.streamflix.user.dto.ProfileCreateRequest;
import com.streamflix.user.dto.ProfileDto;
import com.streamflix.user.dto.ProfileUpdateRequest;
import com.streamflix.user.entity.User;
import com.streamflix.user.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProfileDto>>> getProfiles(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfilesForUser(user)));
    }

    @GetMapping("/{profileId}")
    public ResponseEntity<ApiResponse<ProfileDto>> getProfile(
            @PathVariable Long profileId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getProfile(profileId, user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProfileDto>> createProfile(
            @Valid @RequestBody ProfileCreateRequest request,
            @AuthenticationPrincipal User user) {
        ProfileDto profile = profileService.createProfile(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Profile created", profile));
    }

    @PutMapping("/{profileId}")
    public ResponseEntity<ApiResponse<ProfileDto>> updateProfile(
            @PathVariable Long profileId,
            @Valid @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(profileService.updateProfile(profileId, request, user)));
    }

    @DeleteMapping("/{profileId}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @PathVariable Long profileId,
            @AuthenticationPrincipal User user) {
        profileService.deleteProfile(profileId, user);
        return ResponseEntity.ok(ApiResponse.success("Profile deleted", null));
    }
}
