package com.kylergib.diybettracker.entity;

public class BetStats {
    private String statName;
    private double profit;
    private double stake;
    private double freeBetStake;
    private double returnOnInvestment;
    private int openBets;
    private int wonBets;
    private int lostBets;
    private int voidBets;

    public BetStats(String statName, double profit, double stake, double freeBetStake, double returnOnInvestment, int openBets, int wonBets, int lostBets, int voidBets) {
        this.statName = statName;
        this.profit = profit;
        this.stake = stake;
        this.freeBetStake = freeBetStake;
        this.returnOnInvestment = returnOnInvestment;
        this.openBets = openBets;
        this.wonBets = wonBets;
        this.lostBets = lostBets;
        this.voidBets = voidBets;
    }

    public String getStatName() {
        return statName;
    }

    public void setStatName(String statName) {
        this.statName = statName;
    }

    public double getProfit() {
        return profit;
    }

    public void setProfit(double profit) {
        this.profit = profit;
    }

    public double getStake() {
        return stake;
    }

    public void setStake(double stake) {
        this.stake = stake;
    }

    public double getFreeBetStake() {
        return freeBetStake;
    }

    public void setFreeBetStake(double freeBetStake) {
        this.freeBetStake = freeBetStake;
    }

    public double getReturnOnInvestment() {
        return returnOnInvestment;
    }

    public void setReturnOnInvestment(double returnOnInvestment) {
        this.returnOnInvestment = returnOnInvestment;
    }

    public int getOpenBets() {
        return openBets;
    }

    public void setOpenBets(int openBets) {
        this.openBets = openBets;
    }

    public int getWonBets() {
        return wonBets;
    }

    public void setWonBets(int wonBets) {
        this.wonBets = wonBets;
    }

    public int getLostBets() {
        return lostBets;
    }

    public void setLostBets(int lostBets) {
        this.lostBets = lostBets;
    }

    public int getVoidBets() {
        return voidBets;
    }

    public void setVoidBets(int voidBets) {
        this.voidBets = voidBets;
    }
}
