package com.streamflix.rating.service;

import com.streamflix.common.exception.ResourceNotFoundException;
import com.streamflix.content.entity.Content;
import com.streamflix.content.repository.ContentRepository;
import com.streamflix.rating.dto.RateRequest;
import com.streamflix.rating.dto.RatingDto;
import com.streamflix.rating.entity.Rating;
import com.streamflix.rating.repository.RatingRepository;
import com.streamflix.user.entity.Profile;
import com.streamflix.user.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;

    @Transactional
    public RatingDto rateContent(Long profileId, RateRequest request) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + request.getContentId()));

        // Upsert: update existing rating or create new one
        Rating rating = ratingRepository.findByProfileIdAndContentId(profileId, request.getContentId())
                .orElseGet(() -> Rating.builder()
                        .profile(profile)
                        .content(content)
                        .build());

        rating.setScore(request.getScore());
        rating = ratingRepository.save(rating);

        log.info("Profile {} rated content {} with score {}", profileId, request.getContentId(), request.getScore());
        return buildRatingDto(request.getContentId(), rating.getScore());
    }

    @Transactional(readOnly = true)
    public RatingDto getRating(Long profileId, Long contentId) {
        if (!contentRepository.existsById(contentId)) {
            throw new ResourceNotFoundException("Content not found with id: " + contentId);
        }

        Integer userScore = ratingRepository.findByProfileIdAndContentId(profileId, contentId)
                .map(Rating::getScore)
                .orElse(null);

        return buildRatingDto(contentId, userScore);
    }

    @Transactional
    public void deleteRating(Long profileId, Long contentId) {
        Rating rating = ratingRepository.findByProfileIdAndContentId(profileId, contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));
        ratingRepository.delete(rating);
        log.info("Profile {} deleted rating for content {}", profileId, contentId);
    }

    private RatingDto buildRatingDto(Long contentId, Integer userScore) {
        Object[] stats = ratingRepository.getAggregateStats(contentId);
        // Safe Number casts — Hibernate may return BigDecimal/BigInteger depending on JDBC driver
        Double averageScore = stats[0] != null ? ((Number) stats[0]).doubleValue() : null;
        Long totalRatings = stats[1] != null ? ((Number) stats[1]).longValue() : 0L;

        return RatingDto.builder()
                .contentId(contentId)
                .userScore(userScore)
                .averageScore(averageScore)
                .totalRatings(totalRatings)
                .build();
    }
}
