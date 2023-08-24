package com.kylergib.diybettracker.repository;

import com.kylergib.diybettracker.entity.MyUser;
import org.springframework.data.repository.Repository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;



@RepositoryRestResource(exported = false)
public interface UserRepository extends Repository<MyUser, Long> {
    MyUser save(MyUser myUser);
    MyUser findByName(String name);
    MyUser findById(Long id);
}
