package com.streamflix.watchlist.dto;

import com.streamflix.content.dto.ContentSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchHistoryDto {
    private Long id;
    private ContentSummaryDto content;
    private Long episodeId;
    private Integer episodeNumber;
    private String episodeTitle;
    private Integer progressSeconds;
    private Integer durationSeconds;
    private Boolean completed;
    private LocalDateTime lastWatchedAt;
}
