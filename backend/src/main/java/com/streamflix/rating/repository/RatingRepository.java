package com.streamflix.rating.repository;

import com.streamflix.rating.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByProfileIdAndContentId(Long profileId, Long contentId);

    @Query("SELECT AVG(r.score), COUNT(r) FROM Rating r WHERE r.content.id = :contentId")
    Object[] getAggregateStats(@Param("contentId") Long contentId);
}
