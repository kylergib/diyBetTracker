package com.kylergib.diybettracker.service;

import com.kylergib.diybettracker.entity.Bet;
import com.kylergib.diybettracker.entity.BetStats;
import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.repository.BetRepository;
import com.kylergib.diybettracker.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.json.JSONObject;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;


@Service
public class BetService {

    @Autowired
    private BetRepository betRepository;

    @Autowired
    private UserRepository userRepository;

    private MyUser getUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByName(username);

    }
    @Transactional
    public boolean deleteBet(Long betId) {
        Bet bet = findById(betId);
        MyUser currentUser = getUser();
        if (bet.getMyUser().getId() == currentUser.getId()) {
            betRepository.deleteById(betId);
            return true;
        }
        return false;

    }
    public Map<String, Object> getDailyBetStats(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> map = new HashMap<>();

        int newDay = startDate.getDayOfMonth();
        while (newDay < endDate.getDayOfMonth()) {
            LocalDate newDate = LocalDate.of(startDate.getYear(),startDate.getMonthValue(),newDay);
            double profit = betRepository.getProfitForDate(newDate, getUser());
            map.put("day" +String.valueOf(newDay),profit);
            newDay++;
        }

        return map;
    }
    public Map<String, Object> getMonthlyBetStats(int year) {
        Map<String, Object> map = new HashMap<>();

        int month = 1;
        while (month <= 12) {
            double profit = betRepository.getProfitForMonth(month, year, getUser());
            map.put("month" +String.valueOf(month),profit);
            month++;
        }

        return map;
    }

    public List<BetStats> getBetStats() {
        List<BetStats> stats = new ArrayList<>();
        MyUser currentUser = getUser();

        double totalProfit = betRepository.getTotalProfit(currentUser);
        double totalStake = betRepository.getTotalStake(currentUser);
        double totalFreeBetStake = betRepository.getTotalFreeBetStake(currentUser);

        //TODO: add roi
        double totalROI = 0.00;
        int openBets = betRepository.getTotalStatusCount("open",currentUser);
        int wonBets = betRepository.getTotalStatusCount("won",currentUser);
        int lostBets = betRepository.getTotalStatusCount("lost",currentUser);
        int voidBets = betRepository.getTotalStatusCount("void",currentUser);




        BetStats totalStats = new BetStats("Total",totalProfit,totalStake,totalFreeBetStake,totalROI,
                openBets,wonBets,lostBets,voidBets);
        stats.add(totalStats);
        LocalDate now = LocalDate.now();

        double todayProfit = betRepository.getProfitForDate(now,currentUser);
        double todayStake = betRepository.getStakeForDate(now,currentUser);
        double todayFreeBetStake = betRepository.getFreeBetStakeForDate(now,currentUser);

        //TODO: add roi
        double todayROI = 0.00;
        int todayOpenBets = betRepository.getTodayStatusCount(now,"open",currentUser);
        int todayWonBets = betRepository.getTodayStatusCount(now,"won",currentUser);
        int todayLostBets = betRepository.getTodayStatusCount(now,"lost",currentUser);
        int todayVoidBets = betRepository.getTodayStatusCount(now,"void",currentUser);

        BetStats todayStats = new BetStats("Today",todayProfit,todayStake,todayFreeBetStake,todayROI,
                todayOpenBets,todayWonBets,todayLostBets,todayVoidBets);
        stats.add(todayStats);


        double monthProfit = betRepository.getProfitForMonth(now.getMonthValue(), now.getYear(), currentUser);
        double monthStake = betRepository.getStakeForMonth(now.getMonthValue(), now.getYear(), currentUser);
        double monthFreeBetStake = betRepository.getFreeBetStakeForMonth(now.getMonthValue(), now.getYear(), currentUser);

        //TODO: add roi
        double monthROI = 0.00;
        int monthOpenBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"open",currentUser);
        int monthWonBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"won",currentUser);
        int monthLostBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"lost",currentUser);
        int monthVoidBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"void",currentUser);

        BetStats monthStats = new BetStats("Month",monthProfit,monthStake,monthFreeBetStake,monthROI,
                monthOpenBets,monthWonBets,monthLostBets,monthVoidBets);
        stats.add(monthStats);
        return stats;
    }

    public Bet saveBet(Bet bet) {
        if (bet.getMyUser().getId() != null) {
            System.out.println();

            MyUser user = userRepository.findById(bet.getMyUser().getId());
            if (user != null) {
                bet.setMyUser(user);
            }
        }

        return betRepository.save(bet);
    }

    public List<Bet> getUserBets() {
        MyUser currentUser = getUser();

        if (currentUser != null) {
            return betRepository.findByMyUser(currentUser);
        }

        return new ArrayList<>();
    }
//    public List<Bet> getBetsWithParams(LocalDate startDate, LocalDate endDate, List<String> tags) {
//        MyUser currentUser = getUser();
//        System.out.println("PARAMS");
//        System.out.println(startDate);
//        System.out.println(endDate);
//        System.out.println(tags);
//        System.out.println();
//        if (currentUser != null) {
//            return betRepository.findBetsWithTag(startDate,endDate,tags, currentUser);
//        }
//
//        return new ArrayList<>();
//    }

    public List<Bet> getUserBets(LocalDate startDate, LocalDate endDate,
                                 List<String> tags, List<String> sportsbooks, List<String> statusList,
                                 Integer maxOdds, Integer minOdds, Integer maxStake, Integer minStake,
                                 Integer freeBetMaxStake, Integer freeBetMinStake) {

        MyUser currentUser = getUser();
        if (currentUser == null) {
            return new ArrayList<>();
        }


        if (tags != null && sportsbooks != null && statusList != null) { //all three not null
            return betRepository.findBetsWithParams(startDate, endDate, tags, sportsbooks,
                    maxOdds, minOdds, maxStake, minStake, freeBetMaxStake, freeBetMinStake, statusList, currentUser);

        } else if (tags != null && statusList != null) { //tags and status not null, sportsbook is null
            return betRepository.findBetsWithParams(startDate, endDate,
                    maxOdds, minOdds, tags, maxStake, minStake, freeBetMaxStake, freeBetMinStake, statusList, currentUser);
        }else if (tags !=null && sportsbooks != null) { //tags and sportsbook not null, but status is
            return betRepository.findBetsWithParams(startDate, endDate, tags, sportsbooks,
                    maxOdds, minOdds, maxStake, minStake, freeBetMaxStake, freeBetMinStake, currentUser);
        } else if (sportsbooks != null && statusList != null) { //sportsbook and status list not null
            return betRepository.findBetsWithParams(startDate, endDate, sportsbooks,
                    maxOdds, minOdds, maxStake, minStake, freeBetMaxStake, freeBetMinStake, statusList, currentUser);
        } else if (tags != null) { //tags not null, but the other two are null
            return betRepository.findBetsWithParams(startDate, endDate,
                    maxOdds,minOdds,maxStake,minStake,freeBetMaxStake,freeBetMinStake,
                    tags, currentUser);
        } else if (sportsbooks != null) {
            return betRepository.findBetsWithParams(startDate, endDate,sportsbooks,
                    maxOdds,minOdds,maxStake,minStake,freeBetMaxStake,freeBetMinStake,currentUser);
        } else if (statusList != null) {
            return betRepository.findBetsWithParams(startDate, endDate,
                    maxOdds, minOdds, maxStake, minStake, freeBetMaxStake, freeBetMinStake, currentUser, statusList);
        }else {
            return betRepository.findBetsWithParams(startDate, endDate,
                    maxOdds,minOdds,maxStake,minStake,freeBetMaxStake,freeBetMinStake,currentUser);
        }

    }

    public List<Bet> getUserBets(LocalDate date) {

        MyUser currentUser = getUser();

        if (currentUser != null) {
            return betRepository.findBetsByMyUserAndEventDate(currentUser, date);
        }

        return new ArrayList<>();
    }

    public List<Bet> getUserBets(LocalDate startDate, LocalDate endDate) {

        MyUser currentUser = getUser();

        if (currentUser != null) {
            return betRepository.findBetsByMyUserAndEventDateBetween(currentUser, startDate, endDate);
        }

        return new ArrayList<>();
    }

    public Bet findById(Long betId) {
        Optional<Bet> betOptional = betRepository.findById(betId);
        if(betOptional.isPresent()) {
            Bet bet = betOptional.get();
            // Now you can call methods on bet
            if (bet.getMyUser().getId() != getUser().getId()) {
                return null;
            }
        }
        return betOptional.orElse(null);
    }
    public List<String> getAllSportsbooks() {
        List<Bet> allBets = getUserBets();
        Set<String> allSportsbooks = new HashSet<>();
        System.out.println("starting sportsbooks");

        for (Bet bet : allBets) {
            System.out.println(bet.getSportsbook());
            allSportsbooks.add(bet.getSportsbook());

        }

        return new ArrayList<>(allSportsbooks);
    }
    public List<String> getAllTags() {
        MyUser currentUser = getUser();
        List<String> tags = betRepository.findDistinctTagsByUserId(currentUser.getId());
        return tags;
    }

//    public List<String> getAllSportbooks() {
//        MyUser currentUser = getUser();
//        List<String> tags = betRepository.findDistinctTagsByUserId(currentUser.getId());
//        return tags;
//    }

}
