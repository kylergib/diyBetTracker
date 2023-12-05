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
import java.util.Optional;


@RepositoryRestResource(exported = false)
public interface BetRepository extends PagingAndSortingRepository<Bet, Long>, CrudRepository<Bet, Long> {

    @Override
    @PreAuthorize("#bet.myUser == null or #bet.myUser.name == authentication.name")
    Bet save(@Param("bet") Bet bet);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    @PreAuthorize("#bet.myUser.name == authentication.name")
    void delete(@Param("bet") Bet bet);

    List<Bet> findByMyUser(MyUser myUser);

    Optional<Bet> findById(@Param("id") Long id);

    List<Bet> findAll();

    List<Bet> findBetsByMyUserAndEventDate(MyUser myUser, LocalDate date);
    List<Bet> findBetsByMyUserAndEventDateBetween(MyUser myUser, LocalDate startDate, LocalDate endDate);


    @Query("SELECT DISTINCT b FROM Bet b " +
            "JOIN b.tags bt " +
            "WHERE b.myUser = :myUser AND  bt IN :tags AND " +
            "b.sportsbook IN :sportsbooks AND b.status IN :statuses " +
            "GROUP BY b " +
            "HAVING COUNT(DISTINCT bt) = :tagCount")
    List<Bet> findBetsByAllTags(@Param("tags") List<String> tags, @Param("sportsbooks") List<String> sportsbooks,
                                @Param("statuses") List<String> statuses,@Param("tagCount") Long tagCount,
                                @Param("myUser") MyUser myUser);

    @Query("SELECT COALESCE(SUM(b.profit), 0.0) FROM Bet b " +
            "WHERE b.id IN (" +
            "   SELECT b2.id FROM Bet b2 JOIN b2.tags tag2 " +
            "   WHERE tag2 IN :tags " +
            "   GROUP BY b2.id HAVING COUNT(DISTINCT tag2) = :tagCount" +
            ") " +
            "AND b.myUser = :myUser")
    Double findProfitAllTags(@Param("tags") List<String> tags,@Param("tagCount") int tagCount,
                             @Param("myUser") MyUser myUser);




    //below is used if sportsbook list, status list and tags list have data
    @Query("SELECT DISTINCT b FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.sportsbook IN :sportsbooks AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                       @Param("endDate") LocalDate endDate,
                       @Param("tags") List<String> tags,
                     @Param("sportsbooks") List<String> sportsbooks,
                     @Param("maxOdds") Integer maxOdds,
                     @Param("minOdds") Integer minOdds,
                     @Param("maxStake") Integer maxStake,
                     @Param("minStake") Integer minStake,
                     @Param("freebetMaxStake") Integer freebetMaxStake,
                     @Param("freeBetMinStake") Integer freeBetMinStake,
                     @Param("statusList") List<String> statusList,
                       @Param("myUser") MyUser myUser);
    //below is used if sportsbook list and status list null, but not tags list
    @Query("SELECT DISTINCT b FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("maxStake") Integer maxStake,
                                 @Param("minStake") Integer minStake,
                                 @Param("freebetMaxStake") Integer freebetMaxStake,
                                 @Param("freeBetMinStake") Integer freeBetMinStake,
                                 @Param("tags") List<String> tags,
                                 @Param("myUser") MyUser myUser);
    //the below is used if tags list and status list are null but not sportsbook list
    @Query("SELECT DISTINCT b FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.sportsbook IN :sportsbooks AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("sportsbooks") List<String> sportsbooks,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("maxStake") Integer maxStake,
                                 @Param("minStake") Integer minStake,
                                 @Param("freebetMaxStake") Integer freebetMaxStake,
                                 @Param("freeBetMinStake") Integer freeBetMinStake,
                                 @Param("myUser") MyUser myUser);
    //the below is used if sportsbook list, status list and tags list are null
    @Query("SELECT DISTINCT b FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("maxStake") Integer maxStake,
                                 @Param("minStake") Integer minStake,
                                 @Param("freebetMaxStake") Integer freebetMaxStake,
                                 @Param("freeBetMinStake") Integer freeBetMinStake,
                                 @Param("myUser") MyUser myUser);

    //below is used if sportsbook list and tags list are null but not status list
    @Query("SELECT DISTINCT b FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("maxStake") Integer maxStake,
                                 @Param("minStake") Integer minStake,
                                 @Param("freebetMaxStake") Integer freebetMaxStake,
                                 @Param("freeBetMinStake") Integer freeBetMinStake,
                                 @Param("myUser") MyUser myUser,
                                 @Param("statusList") List<String> statusList);
    //status list and sportsbook list are not null, but tag list is null
    @Query("SELECT DISTINCT b FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.sportsbook IN :sportsbooks AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("sportsbooks") List<String> sportsbooks,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("maxStake") Integer maxStake,
                                 @Param("minStake") Integer minStake,
                                 @Param("freebetMaxStake") Integer freebetMaxStake,
                                 @Param("freeBetMinStake") Integer freeBetMinStake,
                                 @Param("statusList") List<String> statusList,
                                 @Param("myUser") MyUser myUser);
    //status list and tag list are not null, but sportsbook list is null
    @Query("SELECT DISTINCT b FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("tags") List<String> tags,
                                 @Param("maxStake") Integer maxStake,
                                 @Param("minStake") Integer minStake,
                                 @Param("freebetMaxStake") Integer freebetMaxStake,
                                 @Param("freeBetMinStake") Integer freeBetMinStake,
                                 @Param("statusList") List<String> statusList,
                                 @Param("myUser") MyUser myUser);

    //below is used if sportsbook list and tags list are not null, but status list is null
    @Query("SELECT DISTINCT b FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.sportsbook IN :sportsbooks AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds) AND " +
            "(COALESCE(:minStake, NULL) IS NULL OR b.stake >= :minStake) AND " +
            "(COALESCE(:maxStake, NULL) IS NULL OR b.stake <= :maxStake) AND " +
            "(COALESCE(:freeBetMinStake, NULL) IS NULL OR b.stake >= :freeBetMinStake) AND " +
            "(COALESCE(:freebetMaxStake, NULL) IS NULL OR b.freeBetStake <= :freebetMaxStake)")
    List<Bet> findBetsWithParams(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("tags") List<String> tags,
                                 @Param("sportsbooks") List<String> sportsbooks,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("maxStake") Integer maxStake,
                                 @Param("minStake") Integer minStake,
                                 @Param("freebetMaxStake") Integer freebetMaxStake,
                                 @Param("freeBetMinStake") Integer freeBetMinStake,
                                 @Param("myUser") MyUser myUser);

    @Query("SELECT COALESCE(COUNT(*), 0) FROM Bet WHERE status = :status AND myUser = :myUser")
    Integer getTotalStatusCount(String status, MyUser myUser);

    @Query("SELECT COALESCE(COUNT(*), 0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year AND status = :status AND myUser = :myUser")
    Integer getMonthStatusCount(int month, int year, String status, MyUser myUser);

    @Query("SELECT COALESCE(COUNT(*), 0) FROM Bet WHERE eventDate = :date AND status = :status AND myUser = :myUser")
    Integer getTodayStatusCount(LocalDate date, String status, MyUser myUser);

    @Query("SELECT COALESCE(SUM(profit), 0.0) FROM Bet WHERE myUser = :myUser")
    Double getTotalProfit(MyUser myUser);

    @Query("SELECT COALESCE(SUM(stake), 0.0) FROM Bet WHERE myUser = :myUser")
    Double getTotalStake(MyUser myUser);

    @Query("SELECT COALESCE(SUM(freeBetStake), 0.0) FROM Bet WHERE myUser = :myUser")
    Double getTotalFreeBetStake(MyUser myUser);

    @Query("SELECT COALESCE(SUM(profit), 0.0) FROM Bet WHERE eventDate = :date AND myUser = :myUser")
    Double getProfitForDate(LocalDate date, MyUser myUser);

    @Query("SELECT COALESCE(SUM(stake), 0.0) FROM Bet WHERE eventDate = :date AND myUser = :myUser")
    Double getStakeForDate(LocalDate date, MyUser myUser);

    @Query("SELECT COALESCE(SUM(freeBetStake), 0.0) FROM Bet WHERE eventDate = :date AND myUser = :myUser")
    Double getFreeBetStakeForDate(LocalDate date, MyUser myUser);

    @Query("SELECT COALESCE(SUM(profit), 0.0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year AND myUser = :myUser")
    Double getProfitForMonth(int month, int year, MyUser myUser);

    @Query("SELECT COALESCE(SUM(stake), 0.0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year AND myUser = :myUser")
    Double getStakeForMonth(int month, int year, MyUser myUser);

    @Query("SELECT COALESCE(SUM(freeBetStake), 0.0) FROM Bet WHERE MONTH(eventDate) = :month AND YEAR(eventDate) = :year AND myUser = :myUser")
    Double getFreeBetStakeForMonth(int month, int year, MyUser myUser);

    @Query("SELECT DISTINCT t FROM Bet b JOIN b.tags t WHERE b.myUser.id = :userId ORDER BY t")
    List<String> findDistinctTagsByUserId(@Param("userId") Long userId);

    //trying stuff
    @Query("SELECT COALESCE(SUM(b.profit), 0.0) FROM Bet b WHERE " +
        "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate)  AND b.myUser = :myUser")
    Double getProfitBetweenDate(LocalDate startDate, LocalDate endDate, MyUser myUser);

    @Query("SELECT COALESCE(SUM(b.stake), 0.0) FROM Bet b WHERE " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate)  AND b.myUser = :myUser")
    Double getStakeBetweenDate(LocalDate startDate, LocalDate endDate, MyUser myUser);

    @Query("SELECT COALESCE(SUM(b.freeBetStake), 0.0) FROM Bet b WHERE " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate)  AND b.myUser = :myUser")
    Double getFreeBetStakeBetweenDate(LocalDate startDate, LocalDate endDate, MyUser myUser);

    @Query("SELECT COALESCE(COUNT(*), 0) FROM Bet b WHERE " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate)  " +
            "AND b.status = :status AND b.myUser = :myUser")
    Integer getStatusCountBetweenDate(LocalDate startDate, LocalDate endDate, String status, MyUser myUser);

    //below is used if sportsbook list, status list and tags list have data
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.sportsbook IN :sportsbooks AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("tags") List<String> tags,
                                 @Param("sportsbooks") List<String> sportsbooks,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("statusList") List<String> statusList,
                                 @Param("myUser") MyUser myUser);
    //below is used if sportsbook list and status list null, but not tags list
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("tags") List<String> tags,
                                 @Param("myUser") MyUser myUser);
    //the below is used if tags list and status list are null but not sportsbook list
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.sportsbook IN :sportsbooks AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("sportsbooks") List<String> sportsbooks,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("myUser") MyUser myUser);
    //the below is used if sportsbook list, status list and tags list are null
    @Query("SELECT COALESCE(SUM(b.stake),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "b.status = 'Open' AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("myUser") MyUser myUser);

    //below is used if sportsbook list and tags list are null but not status list
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("myUser") MyUser myUser,
                                 @Param("statusList") List<String> statusList);
    //status list and sportsbook list are not null, but tag list is null
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.sportsbook IN :sportsbooks AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("sportsbooks") List<String> sportsbooks,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("statusList") List<String> statusList,
                                 @Param("myUser") MyUser myUser);
    //status list and tag list are not null, but sportsbook list is null
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("tags") List<String> tags,
                                 @Param("statusList") List<String> statusList,
                                 @Param("myUser") MyUser myUser);

    //below is used if sportsbook list and tags list are not null, but status list is null
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.sportsbook IN :sportsbooks AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findStakeOfBets(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 @Param("tags") List<String> tags,
                                 @Param("sportsbooks") List<String> sportsbooks,
                                 @Param("maxOdds") Integer maxOdds,
                                 @Param("minOdds") Integer minOdds,
                                 @Param("myUser") MyUser myUser);


    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.sportsbook IN :sportsbooks AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("tags") List<String> tags,
                           @Param("sportsbooks") List<String> sportsbooks,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("statusList") List<String> statusList,
                           @Param("myUser") MyUser myUser);
    //below is used if sportsbook list and status list null, but not tags list
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("tags") List<String> tags,
                           @Param("myUser") MyUser myUser);
    //the below is used if tags list and status list are null but not sportsbook list
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.sportsbook IN :sportsbooks AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("sportsbooks") List<String> sportsbooks,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("myUser") MyUser myUser);
    //the below is used if sportsbook list, status list and tags list are null
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("myUser") MyUser myUser);

    //below is used if sportsbook list and tags list are null but not status list
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("myUser") MyUser myUser,
                           @Param("statusList") List<String> statusList);
    //status list and sportsbook list are not null, but tag list is null
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "b.sportsbook IN :sportsbooks AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("sportsbooks") List<String> sportsbooks,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("statusList") List<String> statusList,
                           @Param("myUser") MyUser myUser);
    //status list and tag list are not null, but sportsbook list is null
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.status IN :statusList AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("tags") List<String> tags,
                           @Param("statusList") List<String> statusList,
                           @Param("myUser") MyUser myUser);

    //below is used if sportsbook list and tags list are not null, but status list is null
    @Query("SELECT COALESCE(SUM(b.profit),0.0) FROM Bet b " +
            "LEFT JOIN b.tags tag " +
            "WHERE b.myUser = :myUser AND " +
            "(COALESCE(:startDate, NULL) IS NULL OR b.eventDate >= :startDate) AND " +
            "(COALESCE(:endDate, NULL) IS NULL OR b.eventDate <= :endDate) AND " +
            "(tag IN :tags) AND b.sportsbook IN :sportsbooks AND " +
            "(COALESCE(:minOdds, NULL) IS NULL OR b.odds >= :minOdds) AND " +
            "(COALESCE(:maxOdds, NULL) IS NULL OR b.odds <= :maxOdds)")
    Double findProfitOfBets(@Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("tags") List<String> tags,
                           @Param("sportsbooks") List<String> sportsbooks,
                           @Param("maxOdds") Integer maxOdds,
                           @Param("minOdds") Integer minOdds,
                           @Param("myUser") MyUser myUser);

}
