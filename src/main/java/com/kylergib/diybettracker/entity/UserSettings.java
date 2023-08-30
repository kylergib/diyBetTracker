package com.kylergib.diybettracker.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;

@Entity
public class UserSettings {
    private @Id
    @GeneratedValue Long id;

    private String theme;

    @Column(columnDefinition = "json")
    private String tracking;

    private Double unit;

    @ElementCollection
    @CollectionTable(name = "settings_hidden_tags", joinColumns = @JoinColumn(name = "user_settings_id"))
    @Column(name = "hidden_tag")
    private List<String> hiddenTags;

    private String defaultNumberType;
    @ElementCollection
    @CollectionTable(name = "settings_hidden_panels", joinColumns = @JoinColumn(name = "user_settings_id"))
    @Column(name = "hidden_panel")
    private List<String> hiddenPanels;

    private String defaultBetFilter;


    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    private MyUser myUser;

    private @Version
    @JsonIgnore Long version;

    public UserSettings(String theme, String tracking, Double unit, List<String> hiddenTags, String defaultNumberType, List<String> hiddenPanels, String defaultBetFilter, MyUser myUser) {
        this.theme = theme;
        this.tracking = tracking;
        this.unit = unit;
        this.hiddenTags = hiddenTags;
        this.defaultNumberType = defaultNumberType;
        this.hiddenPanels = hiddenPanels;
        this.defaultBetFilter = defaultBetFilter;
        this.myUser = myUser;
    }

    public UserSettings() {

    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserSettings that = (UserSettings) o;
        return Objects.equals(id, that.id) && Objects.equals(theme, that.theme) && Objects.equals(tracking, that.tracking) && Objects.equals(unit, that.unit) && Objects.equals(hiddenTags, that.hiddenTags) && Objects.equals(defaultNumberType, that.defaultNumberType) && Objects.equals(hiddenPanels, that.hiddenPanels) && Objects.equals(defaultBetFilter, that.defaultBetFilter) && Objects.equals(myUser, that.myUser) && Objects.equals(version, that.version);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, theme, tracking, unit, hiddenTags, defaultNumberType, hiddenPanels, defaultBetFilter, myUser, version);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getTracking() {
        return tracking;
    }

    public void setTracking(String tracking) {
        this.tracking = tracking;
    }

    public Double getUnit() {
        return unit;
    }

    public void setUnit(Double unit) {
        this.unit = unit;
    }

    public List<String> getHiddenTags() {
        return hiddenTags;
    }

    public void setHiddenTags(List<String> hiddenTags) {
        this.hiddenTags = hiddenTags;
    }

    public String getDefaultNumberType() {
        return defaultNumberType;
    }

    public void setDefaultNumberType(String defaultNumberType) {
        this.defaultNumberType = defaultNumberType;
    }

    public List<String> getHiddenPanels() {
        return hiddenPanels;
    }

    public void setHiddenPanels(List<String> hiddenPanels) {
        this.hiddenPanels = hiddenPanels;
    }

    public String getDefaultBetFilter() {
        return defaultBetFilter;
    }

    public void setDefaultBetFilter(String defaultBetFilter) {
        this.defaultBetFilter = defaultBetFilter;
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
