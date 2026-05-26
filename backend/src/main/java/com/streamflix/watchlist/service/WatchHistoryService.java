package com.streamflix.watchlist.service;

import com.streamflix.common.exception.BusinessException;
import com.streamflix.common.exception.ResourceNotFoundException;
import com.streamflix.content.entity.Content;
import com.streamflix.content.entity.Episode;
import com.streamflix.content.mapper.ContentMapper;
import com.streamflix.content.repository.ContentRepository;
import com.streamflix.content.repository.EpisodeRepository;
import com.streamflix.user.entity.Profile;
import com.streamflix.user.repository.ProfileRepository;
import com.streamflix.watchlist.dto.ProgressUpdateRequest;
import com.streamflix.watchlist.dto.WatchHistoryDto;
import com.streamflix.watchlist.entity.WatchHistory;
import com.streamflix.watchlist.repository.WatchHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchHistoryService {

    private final WatchHistoryRepository watchHistoryRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;
    private final EpisodeRepository episodeRepository;
    private final ContentMapper contentMapper;

    private static final double COMPLETION_THRESHOLD = 0.9;

    @Transactional
    public WatchHistoryDto updateProgress(Long profileId, ProgressUpdateRequest request) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));
        Content content = contentRepository.findById(request.getContentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + request.getContentId()));

        final Episode episode = request.getEpisodeId() != null
                ? episodeRepository.findById(request.getEpisodeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Episode not found with id: " + request.getEpisodeId()))
                : null;

        // Validate episode belongs to the specified content
        if (episode != null && !episode.getSeason().getContent().getId().equals(request.getContentId())) {
            throw new BusinessException("Episode does not belong to the specified content");
        }

        Optional<WatchHistory> existing;
        if (request.getEpisodeId() != null) {
            existing = watchHistoryRepository.findByProfileIdAndContentIdAndEpisodeId(
                    profileId, request.getContentId(), request.getEpisodeId());
        } else {
            existing = watchHistoryRepository.findByProfileIdAndContentIdAndEpisodeIdIsNull(
                    profileId, request.getContentId());
        }

        WatchHistory history = existing.orElseGet(() -> WatchHistory.builder()
                .profile(profile)
                .content(content)
                .episode(episode)
                .build());

        history.setProgressSeconds(request.getProgressSeconds());
        if (request.getDurationSeconds() != null && request.getDurationSeconds() > 0) {
            history.setDurationSeconds(request.getDurationSeconds());
        }
        history.setLastWatchedAt(LocalDateTime.now());

        // Auto-mark as completed if watched >= 90% of duration
        if (history.getDurationSeconds() != null && history.getDurationSeconds() > 0) {
            double progress = (double) history.getProgressSeconds() / history.getDurationSeconds();
            history.setCompleted(progress >= COMPLETION_THRESHOLD);
        }

        history = watchHistoryRepository.save(history);
        return toDto(history);
    }

    @Transactional(readOnly = true)
    public List<WatchHistoryDto> getContinueWatching(Long profileId, int limit) {
        List<WatchHistory> items = watchHistoryRepository.findByProfileIdAndCompletedFalseOrderByLastWatchedAtDesc(
                profileId, PageRequest.of(0, Math.min(limit, 50)));
        return items.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<WatchHistoryDto> getRecentlyWatched(Long profileId, int limit) {
        List<WatchHistory> items = watchHistoryRepository.findByProfileIdOrderByLastWatchedAtDesc(
                profileId, PageRequest.of(0, Math.min(limit, 50)));
        return items.stream().map(this::toDto).toList();
    }

    private WatchHistoryDto toDto(WatchHistory history) {
        Episode ep = history.getEpisode();
        return WatchHistoryDto.builder()
                .id(history.getId())
                .content(contentMapper.toSummaryDto(history.getContent()))
                .episodeId(ep != null ? ep.getId() : null)
                .episodeNumber(ep != null ? ep.getEpisodeNumber() : null)
                .episodeTitle(ep != null ? ep.getName() : null)
                .progressSeconds(history.getProgressSeconds())
                .durationSeconds(history.getDurationSeconds())
                .completed(history.getCompleted())
                .lastWatchedAt(history.getLastWatchedAt())
                .build();
    }
}
