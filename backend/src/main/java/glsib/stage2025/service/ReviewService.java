package glsib.stage2025.service;

import glsib.stage2025.model.Review;
import glsib.stage2025.model.Service;
import glsib.stage2025.repository.ReviewRepository;
import glsib.stage2025.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    public Review saveReviewAndUpdateServiceRating(Review review) {
        // 1. Save the new review
        Review savedReview = reviewRepository.save(review);

        // 2. Update the service's average rating
        updateAverageRating(review.getServiceId());

        return savedReview;
    }

    private void updateAverageRating(String serviceId) {
        List<Review> reviews = reviewRepository.findByServiceId(serviceId);
        if (reviews.isEmpty()) {
            return;
        }

        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Optional<Service> serviceOptional = serviceRepository.findById(serviceId);
        if (serviceOptional.isPresent()) {
            Service service = serviceOptional.get();
            // Round to one decimal place
            double roundedAverage = Math.round(average * 10.0) / 10.0;
            service.setRating(roundedAverage);
            serviceRepository.save(service);
        }
    }
} 