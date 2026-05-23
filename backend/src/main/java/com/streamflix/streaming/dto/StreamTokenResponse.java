package com.streamflix.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StreamTokenResponse {
    private String streamUrl;
    private String token;
    private Long expiresAt;
}
