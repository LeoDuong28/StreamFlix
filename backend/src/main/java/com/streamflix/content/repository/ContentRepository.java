package com.streamflix.content.repository;

import com.streamflix.content.entity.Content;
import com.streamflix.content.entity.ContentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long>, JpaSpecificationExecutor<Content> {

    Optional<Content> findByTmdbId(Integer tmdbId);

    Optional<Content> findBySlug(String slug);

    boolean existsByTmdbId(Integer tmdbId);

    @EntityGraph(attributePaths = {"genres"})
    @Query("SELECT c FROM Content c WHERE c.id = :id")
    Optional<Content> findByIdWithGenresAndSeasons(@Param("id") Long id);

    @EntityGraph(attributePaths = {"genres"})
    @Query("SELECT c FROM Content c WHERE c.slug = :slug")
    Optional<Content> findBySlugWithGenresAndSeasons(@Param("slug") String slug);

    @Query("SELECT DISTINCT c FROM Content c LEFT JOIN FETCH c.genres WHERE c.id IN " +
           "(SELECT c2.id FROM Content c2 WHERE c2.isFeatured = true ORDER BY c2.updatedAt DESC LIMIT :limit)")
    List<Content> findFeaturedWithGenres(@Param("limit") int limit);

    @Query("SELECT DISTINCT c FROM Content c LEFT JOIN FETCH c.genres WHERE c.id IN " +
           "(SELECT c2.id FROM Content c2 ORDER BY c2.voteAverage DESC, c2.voteCount DESC LIMIT :limit)")
    List<Content> findTrendingWithGenres(@Param("limit") int limit);

    @Query("SELECT DISTINCT c FROM Content c JOIN c.genres g WHERE g.id = :genreId")
    Page<Content> findByGenreId(@Param("genreId") Integer genreId, Pageable pageable);

    Page<Content> findByType(ContentType type, Pageable pageable);

    @Query(value = "SELECT * FROM content WHERE MATCH(title, overview) AGAINST(:query IN NATURAL LANGUAGE MODE)",
           countQuery = "SELECT count(*) FROM content WHERE MATCH(title, overview) AGAINST(:query IN NATURAL LANGUAGE MODE)",
           nativeQuery = true)
    Page<Content> searchFullText(@Param("query") String query, Pageable pageable);

    @Modifying
    @Query("UPDATE Content c SET c.isFeatured = true WHERE c.id IN :ids")
    void markAsFeatured(@Param("ids") List<Long> ids);
}
