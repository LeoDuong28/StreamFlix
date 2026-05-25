package com.streamflix.user.repository;

import com.streamflix.user.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    List<Profile> findByUserId(Long userId);

    long countByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    /**
     * Returns the owner's user ID for a given profile, or empty if profile doesn't exist.
     */
    @Query("SELECT p.user.id FROM Profile p WHERE p.id = :profileId")
    java.util.Optional<Long> findUserIdByProfileId(@Param("profileId") Long profileId);
}
