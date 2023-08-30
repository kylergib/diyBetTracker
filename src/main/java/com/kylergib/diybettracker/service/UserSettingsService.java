package com.kylergib.diybettracker.service;

import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.Role;
import com.kylergib.diybettracker.entity.UserSettings;
import com.kylergib.diybettracker.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.LinkedHashMap;
import java.util.Map;


@Service
public class UserSettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;
    @Autowired
    private MyUserDetailsService myUserDetailsService;

    public UserSettings getSettingsByMyUser(MyUser myUser) {
        return userSettingsRepository.findByMyUser(myUser);

    }
//    public UserSettings save(UserSettings userSettings) {
//
//    }
    public UserSettings updateSettings(Map<String, Object> updates) {
        MyUser currentUser = myUserDetailsService.getUser();

        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return null;
            }
        }


        UserSettings userSettings = getSettingsByMyUser(currentUser);


        if (userSettings == null) {
            return null;
        }
        if (updates.containsKey("theme")) {
            userSettings.setTheme((String) updates.get("theme"));
        }
//        if (updates.containsKey(("tracking"))) {
//            System.out.println("TRACKING");
//
//            LinkedHashMap<String, Object> tracking = (LinkedHashMap<String, Object>) updates.get("tracking");
//            userSettings.setTracking(tracking.toString());
//            System.out.println(tracking.toString());
//            //TODO: left off getting errors
//        }
        if (updates.containsKey("unit")) {
            userSettings.setUnit(Double.parseDouble((String) updates.get("tracking")));//monitor?
        }
        if (updates.containsKey("hiddenTags")) {
//            userSettings.setHiddenTags((String) updates.get("hiddenTags"));
        }
        if (updates.containsKey("defaultNumberType")) {
            userSettings.setDefaultNumberType((String) updates.get("defaultNumberType"));
        }
        if (updates.containsKey("hiddenPanels")) {
//            userSettings.setHiddenPanels();
        }
        if (updates.containsKey("defaultBetFilter")) {
            userSettings.setDefaultBetFilter((String) updates.get("defaultBetFilter"));
        }
        userSettingsRepository.save(userSettings);
        return userSettings;
    }


}
