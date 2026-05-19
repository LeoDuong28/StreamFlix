package com.streamflix.content.controller;

import com.streamflix.common.dto.ApiResponse;
import com.streamflix.common.dto.PagedResponse;
import com.streamflix.content.dto.ContentDetailDto;
import com.streamflix.content.dto.ContentSummaryDto;
import com.streamflix.content.dto.GenreDto;
import com.streamflix.content.dto.GenreWithContentDto;
import com.streamflix.content.entity.ContentType;
import com.streamflix.content.service.ContentService;
import com.streamflix.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ContentSummaryDto>>> getContent(
            @RequestParam(required = false) ContentType type,
            @RequestParam(required = false) Integer genreId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Boolean premium,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy) {

        return ResponseEntity.ok(ApiResponse.success(
                contentService.getContent(type, genreId, year, premium, page, size, sortBy)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentDetailDto>> getContentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        ContentDetailDto detail = contentService.getContentById(id);
        stripVideoUrlIfNotAuthorized(detail, user);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ContentDetailDto>> getContentBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal User user) {
        ContentDetailDto detail = contentService.getContentBySlug(slug);
        stripVideoUrlIfNotAuthorized(detail, user);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ContentSummaryDto>>> getFeaturedContent() {
        return ResponseEntity.ok(ApiResponse.success(contentService.getFeaturedContent()));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<ContentSummaryDto>>> getTrendingContent() {
        return ResponseEntity.ok(ApiResponse.success(contentService.getTrendingContent()));
    }

    @GetMapping("/genre/{genreId}")
    public ResponseEntity<ApiResponse<PagedResponse<ContentSummaryDto>>> getContentByGenre(
            @PathVariable Integer genreId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success(
                contentService.getContentByGenre(genreId, page, size)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ContentSummaryDto>>> searchContent(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        String trimmed = q != null ? q.trim() : "";
        if (trimmed.length() < 2 || trimmed.length() > 200) {
            return ResponseEntity.ok(ApiResponse.success(PagedResponse.<ContentSummaryDto>builder()
                    .content(List.of()).page(0).size(size).totalElements(0).totalPages(0).last(true)
                    .build()));
        }
        return ResponseEntity.ok(ApiResponse.success(
                contentService.searchContent(trimmed, page, size)));
    }

    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<GenreDto>>> getAllGenres() {
        return ResponseEntity.ok(ApiResponse.success(contentService.getAllGenres()));
    }

    @GetMapping("/browse")
    public ResponseEntity<ApiResponse<List<GenreWithContentDto>>> getBrowseContent(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(
                contentService.getGenresWithContent(limit)));
    }

    /**
     * Strip videoUrl from response if content is premium and user is not a premium subscriber.
     * Public (unauthenticated) users also cannot see premium video URLs.
     */
    private void stripVideoUrlIfNotAuthorized(ContentDetailDto detail, User user) {
        if (detail == null || !Boolean.TRUE.equals(detail.getIsPremium())) return;

        boolean hasPremiumAccess = user != null && user.getAuthorities().stream()
                .anyMatch(a -> "ROLE_PREMIUM".equals(a.getAuthority()) || "ROLE_ADMIN".equals(a.getAuthority()));

        if (!hasPremiumAccess) {
            detail.setVideoUrl(null);
            // Also strip episode-level video URLs
            if (detail.getSeasons() != null) {
                detail.getSeasons().forEach(season -> {
                    if (season.getEpisodes() != null) {
                        season.getEpisodes().forEach(ep -> ep.setVideoUrl(null));
                    }
                });
            }
        }
    }
}
