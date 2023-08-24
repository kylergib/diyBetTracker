package com.kylergib.diybettracker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

    @RequestMapping(value = {"/","/home"})
    public String index() {
//        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
//
//        List<String> roles = userDetails.getAuthorities().stream()
//                .map(GrantedAuthority::getAuthority)
//                .toList();
//
//        // Now you can work with the roles (e.g., check if a specific role exists)
//        System.out.println(userDetails);
//        System.out.println(roles);
//        if (roles.contains("ROLE_MANAGER")) {
//            System.out.println("HAS ROLE MANAGE?");
//        }
        return "index";
    }

}
