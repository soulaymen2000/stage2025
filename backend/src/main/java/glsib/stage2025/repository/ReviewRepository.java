package glsib.stage2025.repository;

import glsib.stage2025.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByServiceId(String serviceId);
} 