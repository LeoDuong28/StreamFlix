package com.streamflix.watchlist.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressUpdateRequest {

    @NotNull(message = "Content ID is required")
    private Long contentId;

    private Long episodeId;

    @NotNull(message = "Progress is required")
    @Min(value = 0, message = "Progress must be non-negative")
    private Integer progressSeconds;

    @Min(value = 0, message = "Duration must be non-negative")
    private Integer durationSeconds;
}
