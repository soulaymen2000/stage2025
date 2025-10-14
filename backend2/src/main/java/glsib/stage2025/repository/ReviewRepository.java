package glsib.stage2025.repository;

import glsib.stage2025.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByService_Id(Long serviceId);

    // Find reviews by user id
    List<Review> findByUser_Id(Long userId);
} 