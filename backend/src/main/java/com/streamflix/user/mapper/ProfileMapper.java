package com.streamflix.user.mapper;

import com.streamflix.user.dto.ProfileDto;
import com.streamflix.user.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProfileMapper {

    ProfileDto toDto(Profile profile);

    List<ProfileDto> toDtoList(List<Profile> profiles);
}
