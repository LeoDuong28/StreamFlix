package com.streamflix.content.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenreWithContentDto {
    private Integer id;
    private String name;
    private List<ContentSummaryDto> content;
}
