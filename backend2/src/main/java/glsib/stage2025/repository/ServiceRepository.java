package glsib.stage2025.repository;

import glsib.stage2025.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByCategory(String category);
    List<Service> findByLocation(String location);
    List<Service> findByOwner_Id(Long ownerId);
} 