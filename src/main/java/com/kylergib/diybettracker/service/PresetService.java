package com.kylergib.diybettracker.service;


import com.kylergib.diybettracker.entity.*;
import com.kylergib.diybettracker.repository.BetRepository;
import com.kylergib.diybettracker.repository.PresetRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
//TODO: left off creating preset service
@Service
public class PresetService {

    @Autowired
    private MyUserDetailsService myUserDetailsService;
    @Autowired
    private PresetRepository presetRepository;

    public Preset savePreset(Preset preset) {
        MyUser myUser = myUserDetailsService.getUser();
        for (Role role: myUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return new Preset();
            }
        }


        if (myUser.getId() != null) {



            preset.setMyUser(myUser);

        }

        return presetRepository.save(preset);
    }

    public List<Preset> getUserPresets() {
        MyUser currentUser = myUserDetailsService.getUser();

        if (currentUser != null) {
            return presetRepository.findByMyUser(currentUser);
        }

        return new ArrayList<>();
    }
    @Transactional
    public boolean deletePreset(Long presetId) {
        Preset preset = findById(presetId);
        MyUser currentUser = myUserDetailsService.getUser();
        System.out.println(currentUser.getRoles());
        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return false;
            }
        }
        if (preset.getMyUser().getId() == currentUser.getId()) {
            presetRepository.deleteById(presetId);
            return true;
        }
        return false;

    }
    public Preset findById(Long betId) {
        MyUser currentUser = myUserDetailsService.getUser();
        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return new Preset();
            }
        }
        Optional<Preset> presetOptional = presetRepository.findById(betId);
        if(presetOptional.isPresent()) {
            Preset preset = presetOptional.get();
            if (preset.getMyUser().getId() != currentUser.getId()) {
                return null;
            }
        }
        return presetOptional.orElse(null);
    }
}
