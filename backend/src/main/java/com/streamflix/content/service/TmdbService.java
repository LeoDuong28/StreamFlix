package com.streamflix.content.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.streamflix.common.exception.BusinessException;
import com.streamflix.common.exception.DuplicateResourceException;
import com.streamflix.content.dto.ContentDetailDto;
import com.streamflix.content.entity.*;
import com.streamflix.content.mapper.ContentMapper;
import com.streamflix.content.repository.ContentRepository;
import com.streamflix.content.repository.GenreRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import com.streamflix.common.util.SlugUtils;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.util.*;

@Service
@Slf4j
public class TmdbService {

    private final RestClient restClient;
    private final GenreRepository genreRepository;
    private final ContentRepository contentRepository;
    private final ContentMapper contentMapper;
    private final String apiKey;

    public TmdbService(
            @Value("${app.tmdb.api-key:}") String apiKey,
            @Value("${app.tmdb.base-url}") String baseUrl,
            GenreRepository genreRepository,
            ContentRepository contentRepository,
            ContentMapper contentMapper) {
        this.apiKey = apiKey;
        this.genreRepository = genreRepository;
        this.contentRepository = contentRepository;
        this.contentMapper = contentMapper;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .requestFactory(ClientHttpRequestFactories.get(
                        ClientHttpRequestFactorySettings.DEFAULTS
                                .withConnectTimeout(Duration.ofSeconds(5))
                                .withReadTimeout(Duration.ofSeconds(15))))
                .build();
    }

    @CacheEvict(value = "genres", allEntries = true)
    @Transactional
    public void syncGenres() {
        syncGenresForType("movie");
        syncGenresForType("tv");
        log.info("TMDB genre sync completed");
    }

    private void syncGenresForType(String type) {
        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/genre/{type}/list")

                        .build(type))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.has("genres")) return;

        for (JsonNode genreNode : response.get("genres")) {
            int tmdbId = genreNode.get("id").asInt();
            String name = genreNode.get("name").asText();

            if (!genreRepository.existsByTmdbId(tmdbId)) {
                genreRepository.save(Genre.builder()
                        .name(name)
                        .tmdbId(tmdbId)
                        .build());
            }
        }
    }

    @Transactional
    public ContentDetailDto importMovie(int tmdbId) {
        if (contentRepository.existsByTmdbId(tmdbId)) {
            throw new DuplicateResourceException("Movie with TMDB ID " + tmdbId + " already imported");
        }

        JsonNode movie = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/{id}")

                        .queryParam("append_to_response", "videos")
                        .build(tmdbId))
                .retrieve()
                .body(JsonNode.class);

        if (movie == null) {
            throw new BusinessException("Failed to fetch movie from TMDB");
        }

        Content content = buildContentFromTmdb(movie, ContentType.MOVIE);
        content = contentRepository.save(content);
        log.info("Imported movie from TMDB: {} (tmdbId={})", content.getTitle(), tmdbId);
        return contentMapper.toDetailDto(content);
    }

    @Transactional
    public ContentDetailDto importSeries(int tmdbId) {
        if (contentRepository.existsByTmdbId(tmdbId)) {
            throw new DuplicateResourceException("Series with TMDB ID " + tmdbId + " already imported");
        }

        JsonNode series = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tv/{id}")

                        .queryParam("append_to_response", "videos")
                        .build(tmdbId))
                .retrieve()
                .body(JsonNode.class);

        if (series == null) {
            throw new BusinessException("Failed to fetch series from TMDB");
        }

        Content content = buildSeriesFromTmdb(series, tmdbId);
        content = contentRepository.save(content);
        log.info("Imported series from TMDB: {} (tmdbId={})", content.getTitle(), tmdbId);
        return contentMapper.toDetailDto(content);
    }

    public List<JsonNode> searchMovies(String query) {
        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")

                        .queryParam("query", query)
                        .build())
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.has("results")) return List.of();
        List<JsonNode> results = new ArrayList<>();
        response.get("results").forEach(results::add);
        return results;
    }

    public List<JsonNode> searchSeries(String query) {
        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/tv")

                        .queryParam("query", query)
                        .build())
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.has("results")) return List.of();
        List<JsonNode> results = new ArrayList<>();
        response.get("results").forEach(results::add);
        return results;
    }

    public List<JsonNode> getPopularMovies(int page) {
        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/popular")

                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.has("results")) return List.of();
        List<JsonNode> results = new ArrayList<>();
        response.get("results").forEach(results::add);
        return results;
    }

    public List<JsonNode> getPopularSeries(int page) {
        JsonNode response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/tv/popular")

                        .queryParam("page", page)
                        .build())
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.has("results")) return List.of();
        List<JsonNode> results = new ArrayList<>();
        response.get("results").forEach(results::add);
        return results;
    }

    private Content buildContentFromTmdb(JsonNode node, ContentType type) {
        String title = type == ContentType.MOVIE ?
                getTextOrNull(node, "title") : getTextOrNull(node, "name");

        Content content = Content.builder()
                .title(title)
                .slug(generateSlug(title))
                .overview(getTextOrNull(node, "overview"))
                .type(type)
                .posterPath(getTextOrNull(node, "poster_path"))
                .backdropPath(getTextOrNull(node, "backdrop_path"))
                .tmdbId(node.get("id").asInt())
                .voteAverage(BigDecimal.valueOf(node.has("vote_average") ? node.get("vote_average").asDouble() : 0))
                .voteCount(node.has("vote_count") ? node.get("vote_count").asInt() : 0)
                .build();

        // Release date
        String dateField = type == ContentType.MOVIE ? "release_date" : "first_air_date";
        String dateStr = getTextOrNull(node, dateField);
        if (dateStr != null && !dateStr.isEmpty()) {
            content.setReleaseDate(LocalDate.parse(dateStr));
        }

        // Runtime
        if (node.has("runtime") && !node.get("runtime").isNull()) {
            content.setRuntime(node.get("runtime").asInt());
        }

        // Trailer
        String trailerUrl = extractTrailerUrl(node);
        if (trailerUrl != null) {
            content.setTrailerUrl(trailerUrl);
        }

        // Genres
        if (node.has("genres")) {
            Set<Genre> genres = new HashSet<>();
            for (JsonNode genreNode : node.get("genres")) {
                int genreTmdbId = genreNode.get("id").asInt();
                genreRepository.findByTmdbId(genreTmdbId).ifPresent(genres::add);
            }
            content.setGenres(genres);
        }

        return content;
    }

    private Content buildSeriesFromTmdb(JsonNode node, int tmdbId) {
        Content content = buildContentFromTmdb(node, ContentType.SERIES);

        // Import seasons
        if (node.has("seasons")) {
            for (JsonNode seasonNode : node.get("seasons")) {
                int seasonNumber = seasonNode.get("season_number").asInt();
                if (seasonNumber == 0) continue; // Skip specials

                Season season = Season.builder()
                        .content(content)
                        .seasonNumber(seasonNumber)
                        .name(getTextOrNull(seasonNode, "name"))
                        .overview(getTextOrNull(seasonNode, "overview"))
                        .posterPath(getTextOrNull(seasonNode, "poster_path"))
                        .build();

                String airDate = getTextOrNull(seasonNode, "air_date");
                if (airDate != null && !airDate.isEmpty()) {
                    season.setAirDate(LocalDate.parse(airDate));
                }

                content.getSeasons().add(season);

                // Fetch episodes for each season
                try {
                    JsonNode seasonDetail = restClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/tv/{id}/season/{num}")
            
                                    .build(tmdbId, seasonNumber))
                            .retrieve()
                            .body(JsonNode.class);

                    if (seasonDetail != null && seasonDetail.has("episodes")) {
                        for (JsonNode epNode : seasonDetail.get("episodes")) {
                            Episode episode = Episode.builder()
                                    .season(season)
                                    .episodeNumber(epNode.get("episode_number").asInt())
                                    .name(getTextOrNull(epNode, "name"))
                                    .overview(getTextOrNull(epNode, "overview"))
                                    .runtime(epNode.has("runtime") && !epNode.get("runtime").isNull() ?
                                            epNode.get("runtime").asInt() : null)
                                    .stillPath(getTextOrNull(epNode, "still_path"))
                                    .build();

                            String epAirDate = getTextOrNull(epNode, "air_date");
                            if (epAirDate != null && !epAirDate.isEmpty()) {
                                episode.setAirDate(LocalDate.parse(epAirDate));
                            }

                            season.getEpisodes().add(episode);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch episodes for season {} of tmdbId={}: {}",
                            seasonNumber, tmdbId, e.getMessage());
                }
            }
        }

        return content;
    }

    private String extractTrailerUrl(JsonNode node) {
        if (!node.has("videos") || !node.get("videos").has("results")) return null;

        for (JsonNode video : node.get("videos").get("results")) {
            String site = getTextOrNull(video, "site");
            String videoType = getTextOrNull(video, "type");
            if ("YouTube".equals(site) && "Trailer".equals(videoType)) {
                return "https://www.youtube.com/watch?v=" + video.get("key").asText();
            }
        }
        return null;
    }

    private String getTextOrNull(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            String text = node.get(field).asText();
            return text.isEmpty() ? null : text;
        }
        return null;
    }

    String generateSlug(String title) {
        return SlugUtils.generateUniqueSlug(title, slug -> contentRepository.findBySlug(slug).isPresent());
    }
}
