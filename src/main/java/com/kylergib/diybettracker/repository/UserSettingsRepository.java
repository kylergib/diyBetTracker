package com.kylergib.diybettracker.repository;

import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.UserSettings;
import org.h2.engine.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface UserSettingsRepository extends Repository<UserSettings, Long> {

    UserSettings save(UserSettings userSettings);
    UserSettings findByMyUser(MyUser myUser);


}
