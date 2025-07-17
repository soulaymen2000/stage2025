package glsib.stage2025.repository;

import glsib.stage2025.model.Service;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ServiceRepository extends MongoRepository<Service, String> {
    List<Service> findByCategory(String category);
    List<Service> findByLocation(String location);
    List<Service> findByOwnerId(String ownerId);
} 