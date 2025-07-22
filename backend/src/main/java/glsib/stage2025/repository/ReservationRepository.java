package glsib.stage2025.repository;

import glsib.stage2025.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByServiceIdIn(List<String> serviceIds);
} 