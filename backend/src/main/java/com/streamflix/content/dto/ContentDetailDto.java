package com.streamflix.content.dto;

import com.streamflix.content.entity.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentDetailDto {
    private Long id;
    private String title;
    private String slug;
    private String overview;
    private ContentType type;
    private LocalDate releaseDate;
    private Integer runtime;
    private String posterPath;
    private String backdropPath;
    private String trailerUrl;
    private String videoUrl;
    private String maturityRating;
    private Boolean isPremium;
    private Boolean isFeatured;
    private BigDecimal voteAverage;
    private Integer voteCount;
    private List<GenreDto> genres;
    private List<SeasonDto> seasons;
}
