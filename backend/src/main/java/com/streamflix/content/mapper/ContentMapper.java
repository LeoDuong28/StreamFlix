package com.streamflix.content.mapper;

import com.streamflix.content.dto.*;
import com.streamflix.content.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ContentMapper {

    GenreDto toGenreDto(Genre genre);

    List<GenreDto> toGenreDtoList(List<Genre> genres);

    @Mapping(target = "releaseYear", expression = "java(content.getReleaseDate() != null ? content.getReleaseDate().getYear() : null)")
    @Mapping(target = "genres", source = "genres")
    ContentSummaryDto toSummaryDto(Content content);

    List<ContentSummaryDto> toSummaryDtoList(List<Content> contents);

    @Mapping(target = "genres", source = "genres")
    @Mapping(target = "seasons", source = "seasons")
    ContentDetailDto toDetailDto(Content content);

    SeasonDto toSeasonDto(Season season);

    EpisodeDto toEpisodeDto(Episode episode);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "genres", ignore = true)
    @Mapping(target = "seasons", ignore = true)
    @Mapping(target = "tmdbId", ignore = true)
    @Mapping(target = "voteAverage", ignore = true)
    @Mapping(target = "voteCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateContentFromRequest(ContentUpdateRequest request, @MappingTarget Content content);
}
