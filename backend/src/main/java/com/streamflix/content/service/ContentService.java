package com.streamflix.content.service;

import com.streamflix.common.dto.PagedResponse;
import com.streamflix.common.exception.BusinessException;
import com.streamflix.common.exception.ResourceNotFoundException;
import com.streamflix.content.dto.*;
import com.streamflix.content.entity.Content;
import com.streamflix.content.entity.ContentType;
import com.streamflix.content.entity.Genre;
import com.streamflix.content.mapper.ContentMapper;
import com.streamflix.content.repository.ContentRepository;
import com.streamflix.content.repository.GenreRepository;
import com.streamflix.content.specification.ContentSpecification;
import com.streamflix.common.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {

    private final ContentRepository contentRepository;
    private final GenreRepository genreRepository;
    private final ContentMapper contentMapper;

    private static final int MAX_BROWSE_LIMIT = 50;

    @Transactional(readOnly = true)
    public PagedResponse<ContentSummaryDto> getContent(
            ContentType type, Integer genreId, Integer year, Boolean premium,
            int page, int size, String sortBy) {

        Sort sort = buildSort(sortBy);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);

        Specification<Content> spec = Specification.where(ContentSpecification.hasType(type))
                .and(ContentSpecification.hasGenre(genreId))
                .and(ContentSpecification.releasedInYear(year))
                .and(ContentSpecification.isPremium(premium));

        Page<Content> contentPage = contentRepository.findAll(spec, pageable);

        return PagedResponse.<ContentSummaryDto>builder()
                .content(contentMapper.toSummaryDtoList(contentPage.getContent()))
                .page(contentPage.getNumber())
                .size(contentPage.getSize())
                .totalElements(contentPage.getTotalElements())
                .totalPages(contentPage.getTotalPages())
                .last(contentPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ContentDetailDto getContentById(Long id) {
        Content content = contentRepository.findByIdWithGenresAndSeasons(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        return contentMapper.toDetailDto(content);
    }

    @Transactional(readOnly = true)
    public ContentDetailDto getContentBySlug(String slug) {
        Content content = contentRepository.findBySlugWithGenresAndSeasons(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with slug: " + slug));
        return contentMapper.toDetailDto(content);
    }

    @Cacheable(value = "featured-content")
    @Transactional(readOnly = true)
    public List<ContentSummaryDto> getFeaturedContent() {
        List<Content> featured = contentRepository.findFeaturedWithGenres(10);
        return contentMapper.toSummaryDtoList(featured);
    }

    @Cacheable(value = "trending-content")
    @Transactional(readOnly = true)
    public List<ContentSummaryDto> getTrendingContent() {
        List<Content> trending = contentRepository.findTrendingWithGenres(20);
        return contentMapper.toSummaryDtoList(trending);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ContentSummaryDto> getContentByGenre(Integer genreId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "voteAverage"));
        Page<Content> contentPage = contentRepository.findByGenreId(genreId, pageable);
        return PagedResponse.<ContentSummaryDto>builder()
                .content(contentMapper.toSummaryDtoList(contentPage.getContent()))
                .page(contentPage.getNumber())
                .size(contentPage.getSize())
                .totalElements(contentPage.getTotalElements())
                .totalPages(contentPage.getTotalPages())
                .last(contentPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<ContentSummaryDto> searchContent(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Content> contentPage = contentRepository.searchFullText(query, pageable);
        return PagedResponse.<ContentSummaryDto>builder()
                .content(contentMapper.toSummaryDtoList(contentPage.getContent()))
                .page(contentPage.getNumber())
                .size(contentPage.getSize())
                .totalElements(contentPage.getTotalElements())
                .totalPages(contentPage.getTotalPages())
                .last(contentPage.isLast())
                .build();
    }

    @Cacheable(value = "genres-with-content")
    @Transactional(readOnly = true)
    public List<GenreWithContentDto> getGenresWithContent(int contentLimit) {
        int boundedLimit = Math.min(Math.max(contentLimit, 1), MAX_BROWSE_LIMIT);
        List<Genre> genres = genreRepository.findAll(Sort.by("name"));
        return genres.stream()
                .map(genre -> {
                    Page<Content> contentPage = contentRepository.findByGenreId(
                            genre.getId(), PageRequest.of(0, boundedLimit, Sort.by(Sort.Direction.DESC, "voteAverage")));
                    return GenreWithContentDto.builder()
                            .id(genre.getId())
                            .name(genre.getName())
                            .content(contentMapper.toSummaryDtoList(contentPage.getContent()))
                            .build();
                })
                .filter(g -> !g.getContent().isEmpty())
                .collect(Collectors.toList());
    }

    @Cacheable(value = "genres")
    @Transactional(readOnly = true)
    public List<GenreDto> getAllGenres() {
        return contentMapper.toGenreDtoList(genreRepository.findAll(Sort.by("name")));
    }

    // --- Admin operations ---

    @CacheEvict(value = {"featured-content", "trending-content", "genres", "genres-with-content"}, allEntries = true)
    @Transactional
    public ContentDetailDto createContent(ContentCreateRequest request) {
        Content content = Content.builder()
                .title(request.getTitle())
                .slug(toSlug(request.getTitle()))
                .overview(request.getOverview())
                .type(request.getType())
                .releaseDate(request.getReleaseDate())
                .runtime(request.getRuntime())
                .posterPath(request.getPosterPath())
                .backdropPath(request.getBackdropPath())
                .trailerUrl(request.getTrailerUrl())
                .videoUrl(request.getVideoUrl())
                .maturityRating(request.getMaturityRating() != null ? request.getMaturityRating() : "PG-13")
                .isPremium(request.getIsPremium() != null && request.getIsPremium())
                .isFeatured(request.getIsFeatured() != null && request.getIsFeatured())
                .build();

        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            Set<Genre> genres = new HashSet<>(genreRepository.findAllById(request.getGenreIds()));
            content.setGenres(genres);
        }

        content = contentRepository.save(content);
        log.info("Content created: {} ({})", content.getTitle(), content.getType());
        return contentMapper.toDetailDto(content);
    }

    @CacheEvict(value = {"featured-content", "trending-content", "genres-with-content"}, allEntries = true)
    @Transactional
    public ContentDetailDto updateContent(Long id, ContentUpdateRequest request) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));

        // Prevent type change on content with existing seasons
        if (request.getType() != null && request.getType() != content.getType()) {
            if (!content.getSeasons().isEmpty()) {
                throw new BusinessException("Cannot change content type when seasons exist");
            }
        }

        contentMapper.updateContentFromRequest(request, content);

        if (request.getTitle() != null) {
            content.setSlug(toSlug(request.getTitle()));
        }

        if (request.getGenreIds() != null) {
            Set<Genre> genres = new HashSet<>(genreRepository.findAllById(request.getGenreIds()));
            content.setGenres(genres);
        }

        content = contentRepository.save(content);
        log.info("Content updated: {} (id={})", content.getTitle(), content.getId());
        return contentMapper.toDetailDto(content);
    }

    @CacheEvict(value = {"featured-content", "trending-content", "genres-with-content"}, allEntries = true)
    @Transactional
    public void deleteContent(Long id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        contentRepository.delete(content);
        log.info("Content deleted: id={}", id);
    }

    String toSlug(String input) {
        return SlugUtils.generateUniqueSlug(input, slug -> contentRepository.findBySlug(slug).isPresent());
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sortBy) {
            case "title" -> Sort.by(Sort.Direction.ASC, "title");
            case "rating" -> Sort.by(Sort.Direction.DESC, "voteAverage");
            case "release" -> Sort.by(Sort.Direction.DESC, "releaseDate");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
