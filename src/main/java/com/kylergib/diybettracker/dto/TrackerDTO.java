package com.kylergib.diybettracker.dto;

import java.util.List;

public class TrackerDTO {
    private Double profit;
    private List<String> tags;
    private List<String> sportsbooks;
    private List<String> statuses;

    public TrackerDTO(Double profit, List<String> tags, List<String> sportsbooks, List<String> statuses) {
        this.profit = profit;
        this.tags = tags;
        this.sportsbooks = sportsbooks;
        this.statuses = statuses;
    }

    public Double getProfit() {
        return profit;
    }

    public void setProfit(Double profit) {
        this.profit = profit;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getSportsbooks() {
        return sportsbooks;
    }

    public void setSportsbooks(List<String> sportsbooks) {
        this.sportsbooks = sportsbooks;
    }

    public List<String> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<String> statuses) {
        this.statuses = statuses;
    }
}
