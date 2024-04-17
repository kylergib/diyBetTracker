package com.kylergib.diybettracker.controller;

import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.UserSettings;
import com.kylergib.diybettracker.repository.UserRepository;
import com.kylergib.diybettracker.service.UserSettingsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserSettingsService userSettingsService;

    private MyUser getUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByName(username);

    }
    @RequestMapping(value = {"/","/home"})
    public String index(Model model) {
        MyUser currentUser = getUser();
        UserSettings userSettings = userSettingsService.getSettingsByMyUser(currentUser);
        String cssSheet = "/diy-light.css";
        String navClass = "navbar navbar-expand-lg navbar-light bg-light";
        if (userSettings != null && userSettings.getTheme().equals("dark")) {
            cssSheet = "/diy-dark.css";
            navClass = "navbar navbar-expand-lg navbar-dark bg-dark";
        }
        model.addAttribute("cssSheet", cssSheet);
        model.addAttribute("navClass", navClass);
        return "index";
    }
    @RequestMapping("/invalidate-session")
    public void invalidateSession(HttpServletRequest request) {
        request.getSession().invalidate();
    }

}
