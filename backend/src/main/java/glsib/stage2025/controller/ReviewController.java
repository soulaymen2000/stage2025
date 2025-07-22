package glsib.stage2025.controller;

import glsib.stage2025.model.Review;
import glsib.stage2025.repository.ReviewRepository;
import glsib.stage2025.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/service/{serviceId}")
    public List<Review> getReviewsForService(@PathVariable String serviceId) {
        return reviewRepository.findByServiceId(serviceId);
    }

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        boolean isClient = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("CLIENT") || a.getAuthority().equals("ROLE_CLIENT"));
        if (!isClient) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can rate");
        review.setUserId(auth.getName());
        review.setReviewDate(LocalDateTime.now());
        return reviewService.saveReviewAndUpdateServiceRating(review);
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
} 