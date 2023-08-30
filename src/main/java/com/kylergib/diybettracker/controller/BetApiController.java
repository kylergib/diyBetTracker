package com.kylergib.diybettracker.controller;

import com.kylergib.diybettracker.entity.Bet;
import com.kylergib.diybettracker.service.BetService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bets")
public class BetApiController {

    @Autowired
    private BetService betService;

    @GetMapping
    public ResponseEntity<List<Bet>> getUserBets(@RequestParam(name = "startDate", required = false) LocalDate startDate,
                                                 @RequestParam(name = "endDate", required = false) LocalDate endDate,
                                                 @RequestParam(name="tags", required = false) List<String> tags,
                                                 @RequestParam(name="sportsbooks", required = false) List<String> sportsbooks,
                                                 @RequestParam(name="statusList", required = false) List<String> statusList,
                                                 @RequestParam(name="maxOdds", required = false) Integer maxOdds,
                                                 @RequestParam(name="minOdds", required = false) Integer minOdds,
                                                 @RequestParam(name="maxStake", required = false) Integer maxStake,
                                                 @RequestParam(name="minStake", required = false) Integer minStake,
                                                 @RequestParam(name="freeBetMaxStake", required = false) Integer freeBetMaxStake,
                                                 @RequestParam(name="freeBetMinStake", required = false) Integer freeBetMinStake) {
        List<Bet> userBets;
        userBets = betService.getUserBets(startDate, endDate,
                tags, sportsbooks, statusList,maxOdds, minOdds, maxStake, minStake,
                freeBetMaxStake, freeBetMinStake);

        return ResponseEntity.ok(userBets);
    }

    @PostMapping("/addBet")
    public ResponseEntity<Bet> createBet(@RequestBody Bet bet) {
        Bet savedBet = betService.saveBet(bet);
        return new ResponseEntity<>(savedBet, HttpStatus.CREATED);
    }


    @GetMapping("/{date}")
    public ResponseEntity<List<Bet>> getUserBetsForDate(@PathVariable String date) {
        LocalDate betDate = LocalDate.parse(date);
        List<Bet> userBets = betService.getUserBets(betDate);
        return ResponseEntity.ok(userBets);
    }
    @GetMapping("/stats")
    public ResponseEntity<?> getBetStats(@RequestParam(name = "startDate", required = false) LocalDate startDate,
                                                      @RequestParam(name = "endDate", required = false) LocalDate endDate,
                                              @RequestParam(name = "year", required = false) Integer year,
                                              @RequestParam(name="tags", required = false) List<String> tags,
                                              @RequestParam(name="sportsbooks", required = false) List<String> sportsbooks,
                                              @RequestParam(name="statusList", required = false) List<String> statusList,
                                              @RequestParam(name="maxOdds", required = false) Integer maxOdds,
                                              @RequestParam(name="minOdds", required = false) Integer minOdds) {

        boolean extrasNull = tags == null && sportsbooks == null && statusList == null && maxOdds == null && minOdds == null;
        Object betStats;
        if ((startDate == null || endDate == null) && year == null && extrasNull) {
            betStats = betService.getBetStats();
        } else if (year == null && extrasNull) {
            betStats = betService.getDailyBetStats(startDate,endDate);
        } else if (extrasNull) {
            betStats = betService.getMonthlyBetStats(year);
        } else {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(betStats);
    }
    @GetMapping("/stats/dashboard")
    public  ResponseEntity<Object> getDashboardStats(@RequestParam(name = "date", required = false) LocalDate date,
                                                     @RequestParam(name="tags", required = false) List<String> tags,
                                                     @RequestParam(name="sportsbooks", required = false) List<String> sportsbooks){
        return ResponseEntity.ok(betService.getDashboardStats(date, tags, sportsbooks));
    }

    @DeleteMapping("/{betId}")
    public ResponseEntity<?> deleteBet(@PathVariable Long betId) {

        try {
            boolean delete = betService.deleteBet(betId);
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
    @GetMapping("/userTags")
    public ResponseEntity<?> getTags() {

        try {
            List<String> allTags = betService.getAllTags();
            return ResponseEntity.ok(allTags);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping("/userSportsbooks")
    public ResponseEntity<?> getUserSportsbooks() {
        try {
            List<String> allSportsbooks = betService.getAllSportsbooks();
            System.out.println("after getting sportsbooks");
            System.out.println(allSportsbooks);
            return ResponseEntity.ok(allSportsbooks);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PatchMapping("/{betId}")
    public ResponseEntity<Bet> updatePartialBet(@PathVariable Long betId, @RequestBody Map<String, Object> updates) {
        Bet existingBet = betService.findById(betId);
        if (existingBet == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (updates.containsKey("sportsbook")) {
            existingBet.setSportsbook((String) updates.get("sportsbook"));
        }
        if (updates.containsKey("eventDate")) {
            LocalDate date = LocalDate.parse((String) updates.get("eventDate"));
            existingBet.setEventDate(date) ;

        }
        if (updates.containsKey("dateAdded")) {
            LocalDateTime date = LocalDateTime.parse((String) updates.get("dateAdded"));
            existingBet.setDateAdded(date);
        }
        if (updates.containsKey("legs")) {
            existingBet.setLegs((List<String>) updates.get("legs"));
        }
        if (updates.containsKey("odds")) {
            existingBet.setOdds((int) updates.get("odds"));
        }
        if (updates.containsKey("status")) {
            existingBet.setStatus((String) updates.get("status"));
        }
        if (updates.containsKey("stake")) {
            Double value = 0.00;
            if (updates.get("stake") instanceof Double) {
                value = (Double) updates.get("stake");
            } else if (updates.get("stake") instanceof Integer) {
                value = (int) updates.get("stake") * 1.0;
            }
            existingBet.setStake(value);
        }
        if (updates.containsKey("profit")) {
            Double value = 0.00;
            if (updates.get("profit") instanceof Double) {
                value = (Double) updates.get("profit");
            } else if (updates.get("profit") instanceof Integer) {
                value = (int) updates.get("profit") * 1.0;
            }
            existingBet.setProfit(value);
        }
        if (updates.containsKey("tags")) {
            existingBet.setTags((List<String>) updates.get("tags"));
        }
        if (updates.containsKey("freeBetStake")) {
            Double value = 0.00;
            if (updates.get("freeBetStake") instanceof Double) {
                value = (Double) updates.get("freeBetStake");
            } else if (updates.get("freeBetStake") instanceof Integer) {
                value = (int) updates.get("freeBetStake") * 1.0;
            }
            existingBet.setFreeBetStake(value);
        }
        if (updates.containsKey("evPercent")) {
            Double value = 0.00;
            if (updates.get("evPercent") instanceof Double) {
                value = (Double) updates.get("evPercent");
            } else if (updates.get("evPercent") instanceof Integer) {
                value = (int) updates.get("evPercent") * 1.0;
            }
            existingBet.setEvPercent(value);
        }
        if (updates.containsKey("expectedProfit")) {
            Double value = 0.00;
            if (updates.get("expectedProfit") instanceof Double) {
                value = (Double) updates.get("expectedProfit");
            } else if (updates.get("expectedProfit") instanceof Integer) {
                value = (int) updates.get("expectedProfit") * 1.0;
            }
            existingBet.setExpectedProfit(value);
        }
        if (updates.containsKey("freeBetAmountReceived")) {
            Double value = 0.00;
            if (updates.get("freeBetAmountReceived") instanceof Double) {
                value = (Double) updates.get("freeBetAmountReceived");
            } else if (updates.get("freeBetAmountReceived") instanceof Integer) {
                value = (int) updates.get("freeBetAmountReceived") * 1.0;
            }
            existingBet.setFreeBetAmountReceived(value);
        }
        if (updates.containsKey("freeBetWasReceived")) {
            existingBet.setFreeBetWasReceived((boolean) updates.get("freeBetWasReceived"));
        }

        Bet updatedBet = betService.saveBet(existingBet);
        return new ResponseEntity<>(updatedBet, HttpStatus.OK);

    }
}
