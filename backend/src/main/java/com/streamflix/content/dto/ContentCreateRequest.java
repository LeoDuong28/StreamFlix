package com.streamflix.content.dto;

import com.streamflix.content.entity.ContentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ContentCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 500)
    private String title;

    @Size(max = 5000)
    private String overview;

    @NotNull(message = "Content type is required")
    private ContentType type;

    private LocalDate releaseDate;

    @Min(0) @Max(1000)
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
