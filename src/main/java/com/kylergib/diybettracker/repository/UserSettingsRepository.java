package com.kylergib.diybettracker.repository;

import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.UserSettings;
import org.springframework.data.repository.Repository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;


@RepositoryRestResource(exported = false)
public interface UserSettingsRepository extends Repository<UserSettings, Long> {

    UserSettings save(UserSettings userSettings);
    UserSettings findByMyUser(MyUser myUser);


}
