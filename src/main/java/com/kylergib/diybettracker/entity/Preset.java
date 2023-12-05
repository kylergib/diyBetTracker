package com.kylergib.diybettracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
@Entity
public class Preset {

    private @Id
    @GeneratedValue Long id;
    String name;
    @NotNull
    @Column(nullable = false)
    LocalDateTime dateAdded;

    @ElementCollection
    @CollectionTable(name = "preset_tags", joinColumns = @JoinColumn(name = "preset_id"))
    @Column(name = "tag")
    private List<String> tags;

    @ManyToOne(fetch = FetchType.EAGER)
    private MyUser myUser;

    private @Version
    @JsonIgnore Long version;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Preset preset = (Preset) o;
        return Objects.equals(id, preset.id) && Objects.equals(name, preset.name) && Objects.equals(dateAdded, preset.dateAdded) && Objects.equals(tags, preset.tags) && Objects.equals(myUser, preset.myUser) && Objects.equals(version, preset.version);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, dateAdded, tags, myUser, version);
    }

    public Preset() {}

    public Preset(String name, LocalDateTime dateAdded, List<String> tags, MyUser myUser) {
        this.name = name;
        this.dateAdded = dateAdded;
        this.tags = tags;
        this.myUser = myUser;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(LocalDateTime dateAdded) {
        this.dateAdded = dateAdded;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
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
