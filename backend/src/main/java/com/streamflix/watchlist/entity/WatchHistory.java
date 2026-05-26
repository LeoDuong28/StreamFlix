package com.streamflix.watchlist.entity;

import com.streamflix.content.entity.Content;
import com.streamflix.content.entity.Episode;
import com.streamflix.user.entity.Profile;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "watch_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id")
    private Episode episode;

    @Column(name = "progress_seconds")
    @Builder.Default
    private Integer progressSeconds = 0;

    @Column(name = "duration_seconds")
    @Builder.Default
    private Integer durationSeconds = 0;

    @Builder.Default
    private Boolean completed = false;

    @Column(name = "last_watched_at")
    private LocalDateTime lastWatchedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastWatchedAt = LocalDateTime.now();
    }
}
