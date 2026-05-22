package com.streamflix.content.service;

import com.streamflix.content.entity.Content;
import com.streamflix.content.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeederTransactionalHelper {

    private final ContentRepository contentRepository;

    @Transactional
    public void markTopContentAsFeatured() {
        List<Long> topIds = contentRepository.findTrendingWithGenres(5)
                .stream().map(Content::getId).toList();
        if (!topIds.isEmpty()) {
            contentRepository.markAsFeatured(topIds);
        }
    }
}
