package com.kylergib.diybettracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;

@Entity
public class Tracker {
    private @Id
    @GeneratedValue Long id;

    @ElementCollection
    @CollectionTable(name = "tracker_tags", joinColumns = @JoinColumn(name = "tracker_id"))
    @Column(name = "tag")
    private List<String> tags;

    @ElementCollection
    @CollectionTable(name = "tracker_sportsbooks", joinColumns = @JoinColumn(name = "tracker_id"))
    @Column(name = "sportsbook")
    private List<String> sportsbooks;

    @ElementCollection
    @CollectionTable(name = "tracker_statuses", joinColumns = @JoinColumn(name = "tracker_id"))
    @Column(name = "status")
    private List<String> statuses;


    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    private MyUser myUser;

    private @Version
    @JsonIgnore Long version;

    public Tracker(List<String> tags, List<String> sportsbooks, List<String> statuses, MyUser myUser) {
        this.tags = tags;
        this.sportsbooks = sportsbooks;
        this.statuses = statuses;
        this.myUser = myUser;
    }
    public Tracker() {

    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tracker tracker = (Tracker) o;
        return Objects.equals(id, tracker.id) && Objects.equals(tags, tracker.tags) && Objects.equals(sportsbooks, tracker.sportsbooks) && Objects.equals(statuses, tracker.statuses) && Objects.equals(myUser, tracker.myUser) && Objects.equals(version, tracker.version);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tags, sportsbooks, statuses, myUser, version);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
