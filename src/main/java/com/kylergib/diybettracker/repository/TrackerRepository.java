package com.kylergib.diybettracker.repository;


import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.Tracker;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface TrackerRepository extends Repository<Tracker, Long> {
    Tracker save(Tracker tracker);
    List<Tracker> findByMyUser(MyUser myUser);
    Optional<Tracker> findById(@Param("id") Long id);
    void deleteById(@Param("id") Long id);


}
