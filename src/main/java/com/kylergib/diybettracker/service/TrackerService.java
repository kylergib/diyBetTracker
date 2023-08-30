package com.kylergib.diybettracker.service;


import com.kylergib.diybettracker.dto.TrackerDTO;
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
            if (tracker.getMyUser().getId() != currentUser.getId()) {
                return null;
            }
        }
        return trackerOptional.orElse(null);
    }

    public Tracker updateTracker(Long trackerId, Map<String, Object> updates) {
        //todo: possibly remove, as this is not being used. only adding and deleting are available through website
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


        }
        if (updates.containsKey(("sportsbooks"))) {

        }
        if (updates.containsKey(("statuses"))) {


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
            if (tracker != null) {
                Double profit = betService.getProfitOfTags(tracker.getTags(),null,null);
                trackersProfit.add(new TrackerDTO(profit, tracker.getTags(),tracker.getSportsbooks(),tracker.getStatuses()));
            }
        });
        return trackersProfit;



    }

}
