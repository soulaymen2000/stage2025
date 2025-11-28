package glsib.stage2025.repository;

import glsib.stage2025.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUser_Id(Long userId);
    List<Reservation> findByService_IdIn(List<Long> serviceIds);
    List<Reservation> findByService_IdInAndStatus(List<Long> serviceIds, String status);

    // Fetch join to ensure service details are loaded
    @Query("SELECT r FROM Reservation r JOIN FETCH r.service WHERE r.user.id = :userId")
    List<Reservation> findByUserIdWithService(@Param("userId") Long userId);
}