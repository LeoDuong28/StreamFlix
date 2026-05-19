package com.streamflix.content.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.streamflix.common.dto.ApiResponse;
import com.streamflix.content.dto.ContentCreateRequest;
import com.streamflix.content.dto.ContentDetailDto;
import com.streamflix.content.dto.ContentUpdateRequest;
import com.streamflix.content.service.ContentService;
import com.streamflix.content.service.TmdbService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/content")
@RequiredArgsConstructor
public class AdminContentController {

    private final ContentService contentService;
    private final TmdbService tmdbService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContentDetailDto>> createContent(
            @Valid @RequestBody ContentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Content created", contentService.createContent(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentDetailDto>> updateContent(
            @PathVariable Long id, @Valid @RequestBody ContentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Content updated",
                contentService.updateContent(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.ok(ApiResponse.success("Content deleted", null));
    }

    // --- TMDB Import ---

    @PostMapping("/import/movie/{tmdbId}")
    public ResponseEntity<ApiResponse<ContentDetailDto>> importMovie(@PathVariable int tmdbId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Movie imported from TMDB",
                        tmdbService.importMovie(tmdbId)));
    }

    @PostMapping("/import/series/{tmdbId}")
    public ResponseEntity<ApiResponse<ContentDetailDto>> importSeries(@PathVariable int tmdbId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Series imported from TMDB",
                        tmdbService.importSeries(tmdbId)));
    }

    @PostMapping("/import/sync-genres")
    public ResponseEntity<ApiResponse<Void>> syncGenres() {
        tmdbService.syncGenres();
        return ResponseEntity.ok(ApiResponse.success("Genres synced from TMDB", null));
    }

    @GetMapping("/tmdb/search/movie")
    public ResponseEntity<ApiResponse<List<JsonNode>>> searchTmdbMovies(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(tmdbService.searchMovies(q)));
    }

    @GetMapping("/tmdb/search/series")
    public ResponseEntity<ApiResponse<List<JsonNode>>> searchTmdbSeries(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(tmdbService.searchSeries(q)));
    }
}
