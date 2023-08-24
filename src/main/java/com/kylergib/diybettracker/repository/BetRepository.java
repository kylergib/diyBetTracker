package com.kylergib.diybettracker.repository;

import com.kylergib.diybettracker.entity.Bet;
import com.kylergib.diybettracker.entity.MyUser;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RepositoryRestResource(exported = false)
public interface BetRepository extends PagingAndSortingRepository<Bet, Long>, CrudRepository<Bet, Long> {

    @Override
    @PreAuthorize("#bet.myUser == null or #bet.myUser.name == authentication.name")
    Bet save(@Param("bet") Bet bet);

    @Override
//    @PreAuthorize("#bet.myUser.name == authentication.name")
    void deleteById(@Param("id") Long id);

    @Override
    @PreAuthorize("#bet.myUser.name == authentication.name")
    void delete(@Param("bet") Bet bet);

    List<Bet> findByMyUser(MyUser myUser);

    Optional<Bet> findById(@Param("id") Long id);

    List<Bet> findAll();

    List<Bet> findBetsByMyUserAndEventDate(MyUser myUser, LocalDate date);
    List<Bet> findBetsByMyUserAndEventDateBetween(MyUser myUser, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(COUNT(*), 0) FROM Bet WHERE status = :status")
    Integer getTotalStatusCount(String status);

    @Query("SELECT COALESCE(COUNT(*), 0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year AND status = :status")
    Integer getMonthStatusCount(int month, int year, String status);

    @Query("SELECT COALESCE(COUNT(*), 0) FROM Bet WHERE eventDate = :date AND status = :status")
    Integer getTodayStatusCount(LocalDate date, String status);

    @Query("SELECT COALESCE(SUM(profit), 0.0) FROM Bet")
    Double getTotalProfit();

    @Query("SELECT COALESCE(SUM(stake), 0.0) FROM Bet")
    Double getTotalStake();

    @Query("SELECT COALESCE(SUM(freeBetStake), 0.0) FROM Bet")
    Double getTotalFreeBetStake();

    @Query("SELECT COALESCE(SUM(profit), 0.0) FROM Bet WHERE eventDate = :date")
    Double getProfitForDate(LocalDate date);

    @Query("SELECT COALESCE(SUM(stake), 0.0) FROM Bet WHERE eventDate = :date")
    Double getStakeForDate(LocalDate date);

    @Query("SELECT COALESCE(SUM(freeBetStake), 0.0) FROM Bet WHERE eventDate = :date")
    Double getFreeBetStakeForDate(LocalDate date);

    @Query("SELECT COALESCE(SUM(profit), 0.0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year")
    Double getProfitForMonth(int month, int year);

    @Query("SELECT COALESCE(SUM(stake), 0.0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year")
    Double getStakeForMonth(int month, int year);

    @Query("SELECT COALESCE(SUM(freeBetStake), 0.0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year")
    Double getFreeBetStakeForMonth(int month, int year);

    @Query("SELECT DISTINCT t FROM Bet b JOIN b.tags t WHERE b.myUser.id = :userId")
    List<String> findDistinctTagsByUserId(@Param("userId") Long userId);

}
