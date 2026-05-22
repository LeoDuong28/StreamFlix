package com.streamflix.content.repository;

import com.streamflix.content.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Integer> {

    Optional<Genre> findByTmdbId(Integer tmdbId);

    Optional<Genre> findByName(String name);

    boolean existsByTmdbId(Integer tmdbId);
}
