package com.streamflix.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @Size(min = 1, max = 50)
    private String name;

    @Size(max = 500)
    private String avatarUrl;

    private Boolean isKids;

    @Size(max = 10)
    private String language;
}
