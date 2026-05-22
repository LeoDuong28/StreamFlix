package com.streamflix.content.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EpisodeDto {
    private Long id;
    private Integer episodeNumber;
    private String name;
    private String overview;
    private Integer runtime;
    private String stillPath;
    private String videoUrl;
    private LocalDate airDate;
}
