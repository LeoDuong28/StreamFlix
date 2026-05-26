package com.streamflix.watchlist.service;

import com.streamflix.common.dto.PagedResponse;
import com.streamflix.common.exception.BusinessException;
import com.streamflix.common.exception.ResourceNotFoundException;
import com.streamflix.content.entity.Content;
import com.streamflix.content.mapper.ContentMapper;
import com.streamflix.content.repository.ContentRepository;
import com.streamflix.user.entity.Profile;
import com.streamflix.user.repository.ProfileRepository;
import com.streamflix.watchlist.dto.WatchlistItemDto;
import com.streamflix.watchlist.entity.WatchlistItem;
import com.streamflix.watchlist.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;
    private final ContentMapper contentMapper;

    @Transactional(readOnly = true)
    public PagedResponse<WatchlistItemDto> getWatchlist(Long profileId, int page, int size) {
        validateProfileExists(profileId);
        Page<WatchlistItem> items = watchlistRepository.findByProfileIdOrderByCreatedAtDesc(
                profileId, PageRequest.of(page, Math.min(size, 100)));

        return PagedResponse.<WatchlistItemDto>builder()
                .content(items.getContent().stream().map(this::toDto).toList())
                .page(items.getNumber())
                .size(items.getSize())
                .totalElements(items.getTotalElements())
                .totalPages(items.getTotalPages())
                .last(items.isLast())
                .build();
    }

    @Transactional
    public WatchlistItemDto addToWatchlist(Long profileId, Long contentId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + contentId));

        if (watchlistRepository.existsByProfileIdAndContentId(profileId, contentId)) {
            throw new BusinessException("Content is already in watchlist");
        }

        WatchlistItem item = WatchlistItem.builder()
                .profile(profile)
                .content(content)
                .build();

        item = watchlistRepository.save(item);
        log.info("Added content {} to watchlist for profile {}", contentId, profileId);
        return toDto(item);
    }

    @Transactional
    public void removeFromWatchlist(Long profileId, Long contentId) {
        WatchlistItem item = watchlistRepository.findByProfileIdAndContentId(profileId, contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist item not found"));
        watchlistRepository.delete(item);
        log.info("Removed content {} from watchlist for profile {}", contentId, profileId);
    }

    @Transactional(readOnly = true)
    public boolean isInWatchlist(Long profileId, Long contentId) {
        return watchlistRepository.existsByProfileIdAndContentId(profileId, contentId);
    }

    private void validateProfileExists(Long profileId) {
        if (!profileRepository.existsById(profileId)) {
            throw new ResourceNotFoundException("Profile not found with id: " + profileId);
        }
    }

    private WatchlistItemDto toDto(WatchlistItem item) {
        return WatchlistItemDto.builder()
                .id(item.getId())
                .content(contentMapper.toSummaryDto(item.getContent()))
                .addedAt(item.getCreatedAt())
                .build();
    }
}
