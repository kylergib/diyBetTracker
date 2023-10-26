package com.kylergib.diybettracker.controller;

import com.kylergib.diybettracker.dto.TrackerDTO;
import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.Tracker;
import com.kylergib.diybettracker.entity.UserSettings;
import com.kylergib.diybettracker.repository.UserRepository;
import com.kylergib.diybettracker.service.TrackerService;
import com.kylergib.diybettracker.service.UserSettingsService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserSettingsService userSettingsService;
    @Autowired
    private TrackerService trackerService;

    @GetMapping("/current_user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        Map<String, Object> currentUser = new HashMap<>();

        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            MyUser myUser = userRepository.findByName(userDetails.getUsername());
            if (myUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
            currentUser.put("currentUser", myUser);
            UserSettings settingsTest = userSettingsService.getSettingsByMyUser(myUser);
            currentUser.put("settings", userSettingsService.getSettingsByMyUser(myUser));
            return ResponseEntity.ok(currentUser);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }

    @PatchMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> updates) {

        UserSettings updatedSettings = userSettingsService.updateSettings(updates);
        if (updatedSettings != null) {
            return new ResponseEntity<>(updatedSettings, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PatchMapping("/currentUser/tracker/{trackerId}")
    public ResponseEntity<?> updateTracker(@PathVariable Long trackerId,@RequestBody Map<String, Object> updates) {

        Tracker updatedTracker = trackerService.updateTracker(trackerId,updates);
        if (updatedTracker != null) {
            return new ResponseEntity<>(updatedTracker, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/currentUser/trackers")
    public ResponseEntity<?> getTrackers() {
        List<Tracker> userTracker = trackerService.getTrackerByMyUser();
        if (userTracker != null) {
            return ResponseEntity.ok(userTracker);
        } else {
            return ResponseEntity.notFound().build();
        }

    }
    @PostMapping("/currentUser/tracker/add")
    public ResponseEntity<?> updateTracker(@RequestBody Tracker tracker) {
        Tracker savedTracker = trackerService.saveTracker(tracker);
        return new ResponseEntity<>(savedTracker, HttpStatus.CREATED);

    }

    @DeleteMapping("/currentUser/tracker/{trackerId}")
    public ResponseEntity<?> deleteBet(@PathVariable Long trackerId) {

        try {
            boolean delete = trackerService.deleteBet(trackerId);
            if (delete) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized request");
            }
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/currentUser/trackers/profit")
    public ResponseEntity<?> getTrackersProfit() {
        System.out.println("GETTING TRACKERS PROFITS");
        List<TrackerDTO> trackersProfit = trackerService.getTrackersProfit();
        if (trackersProfit != null) {
            return ResponseEntity.ok(trackersProfit);
        } else {
            return ResponseEntity.notFound().build();
        }

    }
    @GetMapping("/session")
    public ResponseEntity<?> getSessionDetails(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {


            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session invalid or expired");
        }

        return ResponseEntity.ok("Session valid");

    }

}
