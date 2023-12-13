package com.kylergib.diybettracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Entity
public class Bet {

    private @Id
    @GeneratedValue Long id;
    String sportsbook;
    LocalDate eventDate;
    @NotNull
    @Column(nullable = false)
    LocalDateTime dateAdded;
    @ElementCollection
    @CollectionTable(name = "bet_legs", joinColumns = @JoinColumn(name = "bet_id"))
    @Column(name = "leg")
    private List<String> legs;
    private int odds;
    private String status;
    private double stake;
    private double profit;
    private double tokenPercent;
    @ElementCollection
    @CollectionTable(name = "bet_tags", joinColumns = @JoinColumn(name = "bet_id"))
    @Column(name = "tag")
    private List<String> tags;
    private double freeBetStake;
    private double evPercent;
    private double expectedProfit;
    private double freeBetAmountReceived;
    private boolean freeBetWasReceived;
    @ManyToOne(fetch = FetchType.EAGER)
    private MyUser myUser;

    private @Version
    @JsonIgnore Long version;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Bet bet = (Bet) o;
        return odds == bet.odds && Double.compare(bet.stake, stake) == 0 && Double.compare(bet.profit, profit) == 0 && Double.compare(bet.freeBetStake, freeBetStake) == 0 && Double.compare(bet.evPercent, evPercent) == 0 && Double.compare(bet.expectedProfit, expectedProfit) == 0 && freeBetAmountReceived == bet.freeBetAmountReceived && freeBetWasReceived == bet.freeBetWasReceived && Objects.equals(id, bet.id) && Objects.equals(sportsbook, bet.sportsbook) && Objects.equals(eventDate, bet.eventDate) && Objects.equals(dateAdded, bet.dateAdded) && Objects.equals(legs, bet.legs) && Objects.equals(status, bet.status) && Objects.equals(tags, bet.tags) && Objects.equals(myUser, bet.myUser) && Objects.equals(version, bet.version);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, sportsbook, eventDate, dateAdded, legs, odds, status, stake, profit, tags, freeBetStake, evPercent, expectedProfit, freeBetAmountReceived, freeBetWasReceived, myUser, version, tokenPercent);
    }

    public Bet() {}

    public Bet(String sportsbook, LocalDate eventDate, LocalDateTime dateAdded, List<String> legs, int odds, String status, double stake, double profit, List<String> tags, double freeBetStake, double evPercent, double expectedProfit, double freeBetAmountReceived, boolean freeBetWasReceived, MyUser myUser, double tokenPercent) {
        this.sportsbook = sportsbook;
        this.eventDate = eventDate;
        this.dateAdded = dateAdded;
        this.legs = legs;
        this.odds = odds;
        this.status = status;
        this.stake = stake;
        this.profit = profit;
        this.tags = tags;
        this.freeBetStake = freeBetStake;
        this.evPercent = evPercent;
        this.expectedProfit = expectedProfit;
        this.freeBetAmountReceived = freeBetAmountReceived;
        this.freeBetWasReceived = freeBetWasReceived;
        this.myUser = myUser;
        this.tokenPercent = tokenPercent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSportsbook() {
        return sportsbook;
    }

    public void setSportsbook(String sportsbook) {
        this.sportsbook = sportsbook;
    }


    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }

    public List<String> getLegs() {
        return legs;
    }

    public void setLegs(List<String> legs) {
        this.legs = legs;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    public List<String> getTags() {
        return tags;
    }


    public boolean getFreeBetWasReceived() {
        return freeBetWasReceived;
    }

    public void setFreeBetWasReceived(boolean freeBetWasReceived) {
        this.freeBetWasReceived = freeBetWasReceived;
    }

    public int getOdds() {
        return odds;
    }

    public void setOdds(int odds) {
        this.odds = odds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getStake() {
        return stake;
    }

    public void setStake(double stake) {
        this.stake = stake;
    }

    public double getProfit() {
        return profit;
    }

    public void setProfit(double profit) {
        this.profit = profit;
    }

    public double getTokenPercent() {
        return tokenPercent;
    }

    public void setTokenPercent(double tokenPercent) {
        this.tokenPercent = tokenPercent;
    }

    public double getFreeBetStake() {
        return freeBetStake;
    }

    public void setFreeBetStake(double freeBetStake) {
        this.freeBetStake = freeBetStake;
    }


    public double getEvPercent() {
        return evPercent;
    }

    public void setEvPercent(double evPercent) {
        this.evPercent = evPercent;
    }

    public double getExpectedProfit() {
        return expectedProfit;
    }

    public void setExpectedProfit(double expectedProfit) {
        this.expectedProfit = expectedProfit;
    }

    public double getFreeBetAmountReceived() {
        return freeBetAmountReceived;
    }

    public void setFreeBetAmountReceived(double freeBetAmountReceived) {
        this.freeBetAmountReceived = freeBetAmountReceived;
    }

    public MyUser getMyUser() {
        return myUser;
    }

    public void setMyUser(MyUser myUser) {
        this.myUser = myUser;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }


}
