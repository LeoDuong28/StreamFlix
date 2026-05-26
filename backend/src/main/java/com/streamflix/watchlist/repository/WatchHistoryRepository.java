package com.streamflix.watchlist.repository;

import com.streamflix.watchlist.entity.WatchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WatchHistoryRepository extends JpaRepository<WatchHistory, Long> {

    Optional<WatchHistory> findByProfileIdAndContentIdAndEpisodeId(Long profileId, Long contentId, Long episodeId);

    Optional<WatchHistory> findByProfileIdAndContentIdAndEpisodeIdIsNull(Long profileId, Long contentId);

    @EntityGraph(attributePaths = {"content", "content.genres", "episode"})
    List<WatchHistory> findByProfileIdAndCompletedFalseOrderByLastWatchedAtDesc(@Param("profileId") Long profileId, Pageable pageable);

    @EntityGraph(attributePaths = {"content", "content.genres", "episode"})
    List<WatchHistory> findByProfileIdOrderByLastWatchedAtDesc(@Param("profileId") Long profileId, Pageable pageable);
}
