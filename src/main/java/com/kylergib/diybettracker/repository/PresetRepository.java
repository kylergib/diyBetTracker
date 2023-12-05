package com.kylergib.diybettracker.repository;

import com.kylergib.diybettracker.entity.Bet;
import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.Preset;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface PresetRepository extends PagingAndSortingRepository<Preset, Long>, CrudRepository<Preset, Long> {

    @Override
    @PreAuthorize("#preset.myUser == null or #preset.myUser.name == authentication.name")
    Preset save(@Param("preset") Preset preset);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    @PreAuthorize("#preset.myUser.name == authentication.name")
    void delete(@Param("preset") Preset preset);

    List<Preset> findByMyUser(MyUser myUser);
}
