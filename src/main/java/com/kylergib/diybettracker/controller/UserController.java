package com.kylergib.diybettracker.controller;

import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.repository.UserRepository;
import com.kylergib.diybettracker.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

//@RestController
//@RequestMapping("/api")
//public class UserController {
//
//    @GetMapping("/current_user")
//    public ResponseEntity<MyUser> getCurrentUser(Authentication authentication) {
//        User userDetails = (User) authentication.getPrincipal();
//        System.out.println(userDetails);
//
//
//
//        if (authentication != null && authentication.getPrincipal() instanceof User) {
//            System.out.println("Authenticated");
//            MyUser currentUser = (MyUser) authentication.getPrincipal();
//            return ResponseEntity.ok(currentUser);
//        }
//        System.out.println("Unauthenticated");
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
//    }
//}
@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/current_user")
    public ResponseEntity<MyUser> getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            MyUser currentUser = userRepository.findByName(userDetails.getUsername());
            if (currentUser != null) {
                return ResponseEntity.ok(currentUser);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }
}
