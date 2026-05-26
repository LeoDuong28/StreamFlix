package com.streamflix.user.service;

import com.streamflix.common.exception.BusinessException;
import com.streamflix.common.exception.ResourceNotFoundException;
import com.streamflix.user.dto.ProfileCreateRequest;
import com.streamflix.user.dto.ProfileDto;
import com.streamflix.user.dto.ProfileUpdateRequest;
import com.streamflix.user.entity.Profile;
import com.streamflix.user.entity.User;
import com.streamflix.user.mapper.ProfileMapper;
import com.streamflix.user.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;
    private final ProfileSecurityService profileSecurityService;

    private static final int DEFAULT_MAX_PROFILES = 5;

    @Transactional(readOnly = true)
    public List<ProfileDto> getProfilesForUser(User user) {
        List<Profile> profiles = profileRepository.findByUserId(user.getId());
        return profileMapper.toDtoList(profiles);
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfile(Long profileId, User user) {
        profileSecurityService.validateOwnership(profileId, user);
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));
        return profileMapper.toDto(profile);
    }

    @Transactional
    public ProfileDto createProfile(ProfileCreateRequest request, User user) {
        long currentCount = profileRepository.countByUserId(user.getId());
        if (currentCount >= DEFAULT_MAX_PROFILES) {
            throw new BusinessException("Maximum number of profiles (" + DEFAULT_MAX_PROFILES + ") reached");
        }

        Profile profile = Profile.builder()
                .user(user)
                .name(request.getName())
                .avatarUrl(request.getAvatarUrl())
                .isKids(request.getIsKids() != null && request.getIsKids())
                .language(request.getLanguage() != null ? request.getLanguage() : "en")
                .build();

        profile = profileRepository.save(profile);
        log.info("Profile created: {} for user {}", profile.getName(), user.getEmail());
        return profileMapper.toDto(profile);
    }

    @Transactional
    public ProfileDto updateProfile(Long profileId, ProfileUpdateRequest request, User user) {
        profileSecurityService.validateOwnership(profileId, user);

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));

        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getIsKids() != null) {
            profile.setIsKids(request.getIsKids());
        }
        if (request.getLanguage() != null) {
            profile.setLanguage(request.getLanguage());
        }

        profile = profileRepository.save(profile);
        log.info("Profile updated: {} (id={})", profile.getName(), profile.getId());
        return profileMapper.toDto(profile);
    }

    @Transactional
    public void deleteProfile(Long profileId, User user) {
        profileSecurityService.validateOwnership(profileId, user);

        long currentCount = profileRepository.countByUserId(user.getId());
        if (currentCount <= 1) {
            throw new BusinessException("Cannot delete the last profile");
        }

        profileRepository.deleteById(profileId);
        log.info("Profile deleted: id={}", profileId);
    }
}
