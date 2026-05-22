package com.streamflix.content.specification;

import com.streamflix.content.entity.Content;
import com.streamflix.content.entity.ContentType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class ContentSpecification {

    private ContentSpecification() {}

    public static Specification<Content> hasType(ContentType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Content> hasGenre(Integer genreId) {
        return (root, query, cb) -> {
            if (genreId == null) return null;
            query.distinct(true);
            return cb.equal(root.join("genres").get("id"), genreId);
        };
    }

    public static Specification<Content> releasedInYear(Integer year) {
        return (root, query, cb) -> {
            if (year == null) return null;
            LocalDate start = LocalDate.of(year, 1, 1);
            LocalDate end = LocalDate.of(year, 12, 31);
            return cb.between(root.get("releaseDate"), start, end);
        };
    }

    public static Specification<Content> isPremium(Boolean premium) {
        return (root, query, cb) -> premium == null ? null : cb.equal(root.get("isPremium"), premium);
    }

    public static Specification<Content> isFeatured(Boolean featured) {
        return (root, query, cb) -> featured == null ? null : cb.equal(root.get("isFeatured"), featured);
    }
}
