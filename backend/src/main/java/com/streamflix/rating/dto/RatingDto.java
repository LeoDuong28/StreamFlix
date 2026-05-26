package com.streamflix.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingDto {
    private Long contentId;
    private Integer userScore;
    private Double averageScore;
    private Long totalRatings;
}
