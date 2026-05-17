package com.streamflix.common.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");

    private SlugUtils() {}

    /**
     * Generates a unique slug from the given title.
     * Uses the provided predicate to check if a slug already exists.
     */
    public static String generateUniqueSlug(String title, Predicate<String> slugExists) {
        if (title == null) return java.util.UUID.randomUUID().toString();

        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        String slug = WHITESPACE.matcher(normalized).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = slug.toLowerCase(Locale.ENGLISH);
        slug = MULTI_DASH.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-|-$", "");

        if (slug.isEmpty()) {
            slug = java.util.UUID.randomUUID().toString();
        }

        String baseSlug = slug;
        int counter = 1;
        while (slugExists.test(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }
}
