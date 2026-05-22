package com.streamflix.content.repository;

import com.streamflix.content.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeasonRepository extends JpaRepository<Season, Long> {

    List<Season> findByContentIdOrderBySeasonNumberAsc(Long contentId);
}
