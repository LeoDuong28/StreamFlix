package com.streamflix.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    private Long id;
    private String name;
    private String avatarUrl;
    private Boolean isKids;
    private String language;
}
