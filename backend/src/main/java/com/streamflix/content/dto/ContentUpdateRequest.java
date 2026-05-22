package com.streamflix.content.dto;

import com.streamflix.content.entity.ContentType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentUpdateRequest {
    @Size(min = 1, max = 500)
    private String title;
    private String overview;
    private ContentType type;
    private LocalDate releaseDate;
    private Integer runtime;
    @Size(max = 500)
    private String posterPath;
    @Size(max = 500)
    private String backdropPath;
    @Size(max = 500)
    private String trailerUrl;
    @Size(max = 500)
    private String videoUrl;
    @Size(max = 10)
    private String maturityRating;
    private Boolean isPremium;
    private Boolean isFeatured;
    private Set<Integer> genreIds;
}
