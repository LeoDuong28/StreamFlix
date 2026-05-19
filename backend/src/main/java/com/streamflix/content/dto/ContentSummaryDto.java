package com.streamflix.content.dto;

import com.streamflix.content.entity.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentSummaryDto {
    private Long id;
    private String title;
    private String slug;
    private ContentType type;
    private String posterPath;
    private String backdropPath;
    private String maturityRating;
    private Boolean isPremium;
    private BigDecimal voteAverage;
    private Integer releaseYear;
    private Integer runtime;
    private List<GenreDto> genres;
}
