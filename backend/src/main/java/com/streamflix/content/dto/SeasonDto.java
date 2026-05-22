package com.streamflix.content.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonDto {
    private Long id;
    private Integer seasonNumber;
    private String name;
    private String overview;
    private String posterPath;
    private LocalDate airDate;
    private List<EpisodeDto> episodes;
}
