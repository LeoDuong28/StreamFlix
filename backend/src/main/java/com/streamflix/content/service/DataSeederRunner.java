package com.streamflix.content.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.streamflix.content.repository.ContentRepository;
import com.streamflix.content.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeederRunner implements CommandLineRunner {

    private final TmdbService tmdbService;
    private final GenreRepository genreRepository;
    private final ContentRepository contentRepository;
    private final DataSeederTransactionalHelper transactionalHelper;

    @Value("${app.tmdb.api-key:}")
    private String tmdbApiKey;

    @Value("${app.seeder.enabled:true}")
    private boolean seederEnabled;

    @Override
    public void run(String... args) {
        if (!seederEnabled) {
            log.info("Data seeder disabled, skipping");
            return;
        }

        if (tmdbApiKey == null || tmdbApiKey.isBlank()) {
            log.warn("TMDB API key not configured, skipping data seed");
            return;
        }

        if (genreRepository.count() == 0) {
            log.info("Seeding genres from TMDB...");
            try {
                tmdbService.syncGenres();
                log.info("Seeded {} genres", genreRepository.count());
            } catch (Exception e) {
                log.error("Failed to seed genres: {}", e.getMessage());
            }
        }

        if (contentRepository.count() < 10) {
            log.info("Seeding popular content from TMDB...");
            seedPopularContent();
        }
    }

    private void seedPopularContent() {
        int imported = 0;

        // Import popular movies (3 pages = ~60 movies)
        for (int page = 1; page <= 3; page++) {
            try {
                List<JsonNode> movies = tmdbService.getPopularMovies(page);
                for (JsonNode movie : movies) {
                    try {
                        int tmdbId = movie.get("id").asInt();
                        if (!contentRepository.existsByTmdbId(tmdbId)) {
                            tmdbService.importMovie(tmdbId);
                            imported++;
                        }
                    } catch (Exception e) {
                        log.debug("Skipping movie: {}", e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch popular movies page {}: {}", page, e.getMessage());
            }
        }

        // Import popular series (1 page = ~20 series)
        try {
            List<JsonNode> series = tmdbService.getPopularSeries(1);
            for (JsonNode show : series) {
                try {
                    int tmdbId = show.get("id").asInt();
                    if (!contentRepository.existsByTmdbId(tmdbId)) {
                        tmdbService.importSeries(tmdbId);
                        imported++;
                    }
                } catch (Exception e) {
                    log.debug("Skipping series: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch popular series: {}", e.getMessage());
        }

        log.info("Seeded {} content items from TMDB", imported);

        // Mark top-rated content as featured (via separate bean to ensure @Transactional works)
        transactionalHelper.markTopContentAsFeatured();
    }
}
