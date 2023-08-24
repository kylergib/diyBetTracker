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
            double profit = betRepository.getProfitForDate(newDate);
            map.put("day" +String.valueOf(newDay),profit);
            newDay++;
        }

        return map;
    }
    public Map<String, Object> getMonthlyBetStats(int year) {
        Map<String, Object> map = new HashMap<>();

        int month = 1;
        while (month <= 12) {
            double profit = betRepository.getProfitForMonth(month, year);
            map.put("month" +String.valueOf(month),profit);
            month++;
        }

        return map;
    }
    public List<BetStats> getBetStats() {
        List<BetStats> stats = new ArrayList<>();

        double totalProfit = betRepository.getTotalProfit();
        double totalStake = betRepository.getTotalStake();
        double totalFreeBetStake = betRepository.getTotalFreeBetStake();

        //TODO: add roi
        double totalROI = 0.00;
        int openBets = betRepository.getTotalStatusCount("open");
        int wonBets = betRepository.getTotalStatusCount("won");
        int lostBets = betRepository.getTotalStatusCount("lost");
        int voidBets = betRepository.getTotalStatusCount("void");




        BetStats totalStats = new BetStats("Total",totalProfit,totalStake,totalFreeBetStake,totalROI,
                openBets,wonBets,lostBets,voidBets);
        stats.add(totalStats);
        LocalDate now = LocalDate.now();

        double todayProfit = betRepository.getProfitForDate(now);
        double todayStake = betRepository.getStakeForDate(now);
        double todayFreeBetStake = betRepository.getFreeBetStakeForDate(now);

        //TODO: add roi
        double todayROI = 0.00;
        int todayOpenBets = betRepository.getTodayStatusCount(now,"open");
        int todayWonBets = betRepository.getTodayStatusCount(now,"won");
        int todayLostBets = betRepository.getTodayStatusCount(now,"lost");
        int todayVoidBets = betRepository.getTodayStatusCount(now,"void");

        BetStats todayStats = new BetStats("Today",todayProfit,todayStake,todayFreeBetStake,todayROI,
                todayOpenBets,todayWonBets,todayLostBets,todayVoidBets);
        stats.add(todayStats);


        double monthProfit = betRepository.getProfitForMonth(now.getMonthValue(), now.getYear());
        double monthStake = betRepository.getStakeForMonth(now.getMonthValue(), now.getYear());
        double monthFreeBetStake = betRepository.getFreeBetStakeForMonth(now.getMonthValue(), now.getYear());

        //TODO: add roi
        double monthROI = 0.00;
        int monthOpenBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"open");
        int monthWonBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"won");
        int monthLostBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"lost");
        int monthVoidBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"void");

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        MyUser currentUser = userRepository.findByName(username);

        if (currentUser != null) {
            return betRepository.findByMyUser(currentUser);
        }

        return new ArrayList<>();
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
        return betOptional.orElse(null);
    }
    public List<String> getAllTags() {
        List<Bet> allBets = getUserBets();
        Set<String> allTags = new HashSet<>();

        for (Bet bet : allBets) {
            allTags.addAll(bet.getTags());
        }

        return new ArrayList<>(allTags);
    }

}
