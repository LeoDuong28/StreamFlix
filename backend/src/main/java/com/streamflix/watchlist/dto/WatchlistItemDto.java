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
public class WatchlistItemDto {
    private Long id;
    private ContentSummaryDto content;
    private LocalDateTime addedAt;
}
