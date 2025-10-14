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
        // Validate service reference
        if (review.getService() == null || review.getService().getId() == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Missing or invalid service reference in review.");
        }
        // Validate rating (1-5)
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "La note doit être comprise entre 1 et 5.");
        }
        // Validate comment (optional, but if present, not blank and max 500 chars)
        if (review.getComment() != null && !review.getComment().trim().isEmpty() && review.getComment().length() > 500) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Le commentaire ne doit pas dépasser 500 caractères.");
        }
        // Defensive: fetch and assign Service entity
        Service service = serviceRepository.findById(review.getService().getId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Service not found for id: " + review.getService().getId()));
        review.setService(service);

        // 1. Save the new review
        Review savedReview = reviewRepository.save(review);

        // 2. Update the service's average rating
        updateAverageRating(review.getService().getId());

        return savedReview;
    }

    private void updateAverageRating(Long serviceId) {
        List<Review> reviews = reviewRepository.findByService_Id(serviceId);
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