package com.kylergib.diybettracker.service;


import com.kylergib.diybettracker.dto.TrackerDTO;
import com.kylergib.diybettracker.entity.Bet;
import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.Role;
import com.kylergib.diybettracker.entity.Tracker;
import com.kylergib.diybettracker.repository.TrackerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TrackerService {

    @Autowired
    private MyUserDetailsService myUserDetailsService;
    @Autowired
    private TrackerRepository trackerRepository;
    @Autowired
    private BetService betService;

    public List<Tracker> getTrackerByMyUser() {
        return trackerRepository.findByMyUser(myUserDetailsService.getUser());
    }
    public Tracker saveTracker(Tracker tracker) {
        MyUser myUser = myUserDetailsService.getUser();
        for (Role role:myUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return null;
            }
        }
        tracker.setMyUser(myUser);
        return trackerRepository.save(tracker);
    }

    public Tracker findById(Long trackerId) {

        MyUser currentUser = myUserDetailsService.getUser();
        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return null;
            }
        }

        Optional<Tracker> trackerOptional = trackerRepository.findById(trackerId);
        if(trackerOptional.isPresent()) {
            Tracker tracker = trackerOptional.get();
            // Now you can call methods on bet
            if (tracker.getMyUser().getId() != currentUser.getId()) {
                return null;
            }
        }
        return trackerOptional.orElse(null);
    }

    public Tracker updateTracker(Long trackerId, Map<String, Object> updates) {
        MyUser currentUser = myUserDetailsService.getUser();

        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return null;
            }
        }
        Tracker tracker = findById(trackerId);
        if (tracker == null) {
            return null;
        }
        if (updates.containsKey(("tags"))) {
            System.out.println("TRACKING TAGS");
            System.out.println(updates.get("tags"));
            System.out.println(updates.get("tags").getClass());


//            LinkedHashMap<String, Object> tracking = (LinkedHashMap<String, Object>) updates.get("tracking");
//            userSettings.setTracking(tracking.toString());
//            System.out.println(tracking.toString());
            //TODO: left off getting errors
        }
        if (updates.containsKey(("sportsbooks"))) {
            System.out.println("TRACKING sportsbooks");
            System.out.println(updates.get("sportsbooks"));
            System.out.println(updates.get("sportsbooks").getClass());


//            LinkedHashMap<String, Object> tracking = (LinkedHashMap<String, Object>) updates.get("tracking");
//            userSettings.setTracking(tracking.toString());
//            System.out.println(tracking.toString());
            //TODO: left off getting errors
        }
        if (updates.containsKey(("statuses"))) {
            System.out.println("TRACKING statuses");
            System.out.println(updates.get("statuses"));
            System.out.println(updates.get("statuses").getClass());


//            LinkedHashMap<String, Object> tracking = (LinkedHashMap<String, Object>) updates.get("tracking");
//            userSettings.setTracking(tracking.toString());
//            System.out.println(tracking.toString());
            //TODO: left off getting errors
        }
//        trackerRepository.save(tracker);
        return tracker;

    }

    @Transactional
    public boolean deleteBet(Long trackerId) {
        Tracker tracker = findById(trackerId);
        MyUser currentUser = myUserDetailsService.getUser();
        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return false;
            }
        }
        if (tracker.getMyUser().getId() == currentUser.getId()) {
            trackerRepository.deleteById(trackerId);
            return true;
        }
        return false;

    }

    public List<TrackerDTO> getTrackersProfit() {
        List<TrackerDTO> trackersProfit = new ArrayList<>();
        List<Tracker> trackers = getTrackerByMyUser();

        trackers.forEach(tracker -> {
            System.out.println(tracker.getTags());
            if (tracker != null) {
                System.out.println(tracker.getSportsbooks());
                System.out.println(tracker.getStatuses());


                Double profit = betService.getProfitOfTags(tracker.getTags(),null,null);
                trackersProfit.add(new TrackerDTO(profit, tracker.getTags(),tracker.getSportsbooks(),tracker.getStatuses()));
            }
        });
        return trackersProfit;



    }

}
