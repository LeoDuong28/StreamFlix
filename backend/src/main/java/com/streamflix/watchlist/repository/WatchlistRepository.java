package com.streamflix.watchlist.repository;

import com.streamflix.watchlist.entity.WatchlistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {

    @EntityGraph(attributePaths = {"content", "content.genres"})
    Page<WatchlistItem> findByProfileIdOrderByCreatedAtDesc(Long profileId, Pageable pageable);

    Optional<WatchlistItem> findByProfileIdAndContentId(Long profileId, Long contentId);

    boolean existsByProfileIdAndContentId(Long profileId, Long contentId);
}
