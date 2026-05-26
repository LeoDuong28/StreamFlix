package com.streamflix.user.service;

import com.streamflix.common.exception.ForbiddenException;
import com.streamflix.common.exception.ResourceNotFoundException;
import com.streamflix.user.entity.User;
import com.streamflix.user.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileSecurityService {

    private final ProfileRepository profileRepository;

    /**
     * Validates that the given profile belongs to the given user.
     * Uses a single query to fetch the owner — no lazy-loading risk, no race condition.
     */
    public void validateOwnership(Long profileId, User user) {
        Long ownerId = profileRepository.findUserIdByProfileId(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));
        if (!ownerId.equals(user.getId())) {
            throw new ForbiddenException("Access denied to this profile");
        }
    }
}
