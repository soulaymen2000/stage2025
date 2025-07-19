package glsib.stage2025.repository;

import glsib.stage2025.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReviewRepository extends MongoRepository<Review, String> {
} 