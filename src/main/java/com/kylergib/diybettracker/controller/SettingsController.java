package com.kylergib.diybettracker.controller;

import com.kylergib.diybettracker.entity.UserSettings;
import com.kylergib.diybettracker.service.UserSettingsService;
import org.springframework.ui.Model;
import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SettingsController {

    @Autowired
    MyUserDetailsService myUserDetailsService;
    @Autowired
    private UserSettingsService userSettingsService;

    @RequestMapping(value = {"/settings"})
    public String index(Model model) {
        MyUser currentUser = myUserDetailsService.getUser();
        UserSettings settingsTest = userSettingsService.getSettingsByMyUser(currentUser);
        String cssSheet = "/diy-light.css";
        String navClass = "navbar navbar-expand-lg navbar-light bg-light";
        if (settingsTest.getTheme().equals("dark")) {
            cssSheet = "/diy-dark.css";
            navClass = "navbar navbar-expand-lg navbar-dark bg-dark";
        }
        model.addAttribute("userName", currentUser.getName());
        model.addAttribute("cssSheet", cssSheet);
        model.addAttribute("navClass", navClass);
        return "settings";
    }


}
