package com.kylergib.diybettracker.service;

import com.kylergib.diybettracker.entity.Bet;
import com.kylergib.diybettracker.entity.BetStats;
import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.entity.Role;
import com.kylergib.diybettracker.repository.BetRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;


@Service
public class BetService {
    @Autowired
    private MyUserDetailsService myUserDetailsService;
    @Autowired
    private BetRepository betRepository;


    @Transactional
    public boolean deleteBet(Long betId) {
        Bet bet = findById(betId);
        MyUser currentUser = myUserDetailsService.getUser();
        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return false;
            }
        }
        if (bet.getMyUser().getId() == currentUser.getId()) {
            betRepository.deleteById(betId);
            return true;
        }
        return false;

    }
    public Map<String, Object> getDailyBetStats(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> map = new HashMap<>();
        MyUser myUser = myUserDetailsService.getUser();

        int newDay = startDate.getDayOfMonth();
        while (newDay <= endDate.getDayOfMonth()) {
            LocalDate newDate = LocalDate.of(startDate.getYear(),startDate.getMonthValue(),newDay);
            double profit = betRepository.getProfitForDate(newDate, myUser);
            map.put("day" +String.valueOf(newDay),profit);
            newDay++;
        }

        return map;
    }
    public Map<String, Object> getMonthlyBetStats(int year) {
        Map<String, Object> map = new HashMap<>();
        MyUser myUser = myUserDetailsService.getUser();
        int month = 1;
        while (month <= 12) {
            double profit = betRepository.getProfitForMonth(month, year, myUser);
            map.put("month" +String.valueOf(month),profit);
            month++;
        }

        return map;
    }

    public Map<String, Object> getDashboardStats(List<String> tags, List<String> sportsbooks, LocalDate startDate, LocalDate endDate, String type) {

        MyUser currentUser = myUserDetailsService.getUser();
        Map<String, Object> map = new HashMap<>();
        if (currentUser == null) {
            return map;
        }
        LocalDate now = LocalDate.now();

        for (String tag : tags) {
            //TODO: add additional map for pending ?
            map.put(tag,betRepository.findProfitOfBets(startDate,endDate,null,null,List.of(tag),currentUser));
        }
        for (String sportsbook : sportsbooks) {
            //TODO: add additional map for pending ?
            map.put(sportsbook,betRepository.findProfitOfBets(startDate,endDate,List.of(sportsbook),null,null,currentUser));
        }
        if (type == null) {

            map.put("pendingStake", betRepository.findStakeOfBets(null,null,null,null,currentUser));
            LocalDate startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

            map.put("weekStats", betweenDateStats(startOfWeek,endOfWeek,currentUser));
            map.put("yearStats", betweenDateStats(LocalDate.of(now.getYear(),1,1),LocalDate.of(now.getYear(),12,31),currentUser));
            map.put("totalStats", totalStats(currentUser));
            map.put("monthStats", monthStats(now,currentUser));
            map.put("todayStats", dayStats(now,currentUser));
            map.put("yesterdayStats", dayStats(now.plusDays(-1),currentUser));
        }




        return map;
    }

    public Map<String, Object> getExtraBetStats(LocalDate startDate, LocalDate endDate,
                                           List<String> tags, List<String> sportsbooks, List<String> statusList,
                                           Integer maxOdds, Integer minOdds, List<String> types) {
        //todo: finish getting extra stats
        MyUser currentUser = myUserDetailsService.getUser();
        Map<String, Object> map = new HashMap<>();
        if (currentUser == null) {
            return map;
        }
        LocalDate now = LocalDate.now();
        Double sumStake;
        Double sumProfit;
        if (types.contains("openBets")) {
            //todo: this needs to be fixed, to account for filters
            int todayOpenBets = betRepository.getTodayStatusCount(now,"open",currentUser);
            int monthOpenBets = betRepository.getMonthStatusCount(now.getMonthValue(), now.getYear(),"open",currentUser);
            //TODO: add week open bets
            int totalOpenBets = betRepository.getTotalStatusCount("open",currentUser);
            map.put("totalOpenBets", totalOpenBets);
            map.put("todayOpenBets", todayOpenBets);
            map.put("monthOpenBets", monthOpenBets);
        }

        if (tags != null && sportsbooks != null && statusList != null) { //all three not null
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate, tags, sportsbooks,
                    maxOdds, minOdds, statusList, currentUser);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate, tags, sportsbooks,
                    maxOdds, minOdds, statusList, currentUser);

        } else if (tags != null && statusList != null) { //tags and status not null, sportsbook is null
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate,
                    maxOdds, minOdds, tags,  statusList, currentUser);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate,
                    maxOdds, minOdds, tags,  statusList, currentUser);
        }else if (tags !=null && sportsbooks != null) { //tags and sportsbook not null, but status is
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate, tags, sportsbooks,
                    maxOdds, minOdds, currentUser);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate, tags, sportsbooks,
                    maxOdds, minOdds, currentUser);
        } else if (sportsbooks != null && statusList != null) { //sportsbook and status list not null
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate, sportsbooks,
                    maxOdds, minOdds, statusList, currentUser);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate, sportsbooks,
                    maxOdds, minOdds, statusList, currentUser);
        } else if (tags != null) { //tags not null, but the other two are null
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate,
                    maxOdds,minOdds, tags, currentUser);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate,
                    maxOdds,minOdds, tags, currentUser);
        } else if (sportsbooks != null) {
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate,sportsbooks,
                    maxOdds,minOdds,currentUser);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate,sportsbooks,
                    maxOdds,minOdds,currentUser);
        } else if (statusList != null) {
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate,
                    maxOdds, minOdds, currentUser, statusList);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate,
                    maxOdds, minOdds, currentUser, statusList);
        } else {
            sumStake = types.contains("sumStake") ? null : betRepository.findStakeOfBets(startDate, endDate,
                    maxOdds,minOdds,currentUser);
            sumProfit = types.contains("sumProfit") ? null : betRepository.findProfitOfBets(startDate, endDate,
                    maxOdds,minOdds,currentUser);
        }
        if (sumStake != null) {
            map.put("stake", sumStake);
        }
        if (sumProfit != null) {
            map.put("profit", sumProfit);
        }

        return map;

    }

    public List<BetStats> getBetStats() {
        List<BetStats> stats = new ArrayList<>();
        MyUser currentUser = myUserDetailsService.getUser();

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
    public BetStats betweenDateStats(LocalDate startDate, LocalDate endDate, MyUser currentUser) {
        return new BetStats("between", betRepository.getProfitBetweenDate(startDate,endDate,currentUser),
                betRepository.getStakeBetweenDate(startDate,endDate,currentUser), betRepository.getFreeBetStakeBetweenDate(startDate,endDate,currentUser),
                0.00, betRepository.getStatusCountBetweenDate(startDate,endDate,"open",currentUser),
                betRepository.getStatusCountBetweenDate(startDate,endDate,"won",currentUser),
                betRepository.getStatusCountBetweenDate(startDate,endDate,"lost",currentUser),
                betRepository.getStatusCountBetweenDate(startDate,endDate,"void",currentUser));
    }

    public BetStats totalStats(MyUser currentUser) {
        double totalProfit = betRepository.getTotalProfit(currentUser);
        double totalStake = betRepository.getTotalStake(currentUser);
        double totalFreeBetStake = betRepository.getTotalFreeBetStake(currentUser);

        //TODO: add roi
        double totalROI = 0.00;
        int openBets = betRepository.getTotalStatusCount("open",currentUser);
        int wonBets = betRepository.getTotalStatusCount("won",currentUser);
        int lostBets = betRepository.getTotalStatusCount("lost",currentUser);
        int voidBets = betRepository.getTotalStatusCount("void",currentUser);

        return new BetStats("Total",totalProfit,totalStake,totalFreeBetStake,totalROI,
                openBets,wonBets,lostBets,voidBets);
    }

    public BetStats dayStats(LocalDate date, MyUser currentUser) {
        double todayProfit = betRepository.getProfitForDate(date,currentUser);
        double todayStake = betRepository.getStakeForDate(date,currentUser);
        double todayFreeBetStake = betRepository.getFreeBetStakeForDate(date,currentUser);

        //TODO: add roi
        double todayROI = 0.00;
        int todayOpenBets = betRepository.getTodayStatusCount(date,"open",currentUser);
        int todayWonBets = betRepository.getTodayStatusCount(date,"won",currentUser);
        int todayLostBets = betRepository.getTodayStatusCount(date,"lost",currentUser);
        int todayVoidBets = betRepository.getTodayStatusCount(date,"void",currentUser);

        return new BetStats("Day",todayProfit,todayStake,todayFreeBetStake,todayROI,
                todayOpenBets,todayWonBets,todayLostBets,todayVoidBets);
    }

    public BetStats monthStats(LocalDate date, MyUser currentUser) {
        double monthProfit = betRepository.getProfitForMonth(date.getMonthValue(), date.getYear(), currentUser);
        double monthStake = betRepository.getStakeForMonth(date.getMonthValue(), date.getYear(), currentUser);
        double monthFreeBetStake = betRepository.getFreeBetStakeForMonth(date.getMonthValue(), date.getYear(), currentUser);

        //TODO: add roi
        double monthROI = 0.00;
        int monthOpenBets = betRepository.getMonthStatusCount(date.getMonthValue(), date.getYear(),"open",currentUser);
        int monthWonBets = betRepository.getMonthStatusCount(date.getMonthValue(), date.getYear(),"won",currentUser);
        int monthLostBets = betRepository.getMonthStatusCount(date.getMonthValue(), date.getYear(),"lost",currentUser);
        int monthVoidBets = betRepository.getMonthStatusCount(date.getMonthValue(), date.getYear(),"void",currentUser);

        return new BetStats("Month",monthProfit,monthStake,monthFreeBetStake,monthROI,
                monthOpenBets,monthWonBets,monthLostBets,monthVoidBets);
    }

    public Bet saveBet(Bet bet) {
        MyUser myUser = myUserDetailsService.getUser();
        for (Role role: myUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return new Bet();
            }
        }


        if (myUser.getId() != null) {
            bet.setMyUser(myUser);
        }
        return betRepository.save(bet);
    }

    public List<Bet> getUserBets() {
        MyUser currentUser = myUserDetailsService.getUser();

        if (currentUser != null) {
            return betRepository.findByMyUser(currentUser);
        }

        return new ArrayList<>();
    };

    public List<Bet> getUserBets(LocalDate startDate, LocalDate endDate,
                                 List<String> tags, List<String> sportsbooks, List<String> statusList,
                                 Integer maxOdds, Integer minOdds, Integer maxStake, Integer minStake,
                                 Integer freeBetMaxStake, Integer freeBetMinStake) {

        MyUser currentUser = myUserDetailsService.getUser();
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

            boolean hasStartDate = startDate != null;
            boolean hasEndDate = endDate != null;

            if (hasStartDate && hasEndDate) {
                return  betRepository.findBetsByMyUserAndEventDateBetween(currentUser, startDate, endDate);
            } else if (hasStartDate) {
                return  betRepository.findBetsByMyUserAndEventDate(currentUser, startDate);
            }else {
                return betRepository.findBetsWithParams(startDate, endDate,
                        maxOdds,minOdds,maxStake,minStake,freeBetMaxStake,freeBetMinStake,currentUser);
            }






        }

    }

    public List<Bet> getUserBets(LocalDate date) {

        MyUser currentUser = myUserDetailsService.getUser();

        if (currentUser != null) {
            return betRepository.findBetsByMyUserAndEventDate(currentUser, date);
        }

        return new ArrayList<>();
    }

    public List<Bet> getUserBets(LocalDate startDate, LocalDate endDate) {

        MyUser currentUser = myUserDetailsService.getUser();

        if (currentUser != null) {
            return betRepository.findBetsByMyUserAndEventDateBetween(currentUser, startDate, endDate);
        }

        return new ArrayList<>();
    }

    public Bet findById(Long betId) {
        MyUser currentUser = myUserDetailsService.getUser();
        for (Role role: currentUser.getRoles()) {
            if (role.getName().equals("TEST")) {
                return new Bet();
            }
        }
        Optional<Bet> betOptional = betRepository.findById(betId);
        if(betOptional.isPresent()) {
            Bet bet = betOptional.get();
            if (bet.getMyUser().getId() != currentUser.getId()) {
                return null;
            }
        }
        return betOptional.orElse(null);
    }
    public List<String> getAllSportsbooks() {
        List<Bet> allBets = getUserBets();
        Set<String> allSportsbooks = new HashSet<>();

        for (Bet bet : allBets) {
            allSportsbooks.add(bet.getSportsbook());

        }

        return new ArrayList<>(allSportsbooks);
    }
    public List<String> getAllTags() {
        MyUser currentUser = myUserDetailsService.getUser();
        List<String> tags = betRepository.findDistinctTagsByUserId(currentUser.getId());
        return tags;
    }
    public Double getProfitOfTags(List<String> tags, List<String> sportsbooks,
                                  List<String> statuses) {
        //todo: get profits of tags/sportsbooks/status collectively, ran into issue if one was null it would through an error.
        MyUser myUser = myUserDetailsService.getUser();

        return betRepository.findProfitAllTags(tags,tags.size(), myUser);
    }

}
