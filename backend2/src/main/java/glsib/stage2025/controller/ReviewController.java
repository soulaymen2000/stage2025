package glsib.stage2025.controller;

import glsib.stage2025.model.User;
import glsib.stage2025.repository.ReviewRepository;
import glsib.stage2025.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Get reviews for the current authenticated user


import glsib.stage2025.model.Review;
import glsib.stage2025.model.User;
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
    @Autowired
    private glsib.stage2025.repository.UserRepository userRepository;
    @Autowired
    private glsib.stage2025.repository.ServiceRepository serviceRepository;

    @GetMapping("/service/{serviceId}")
    public List<Review> getReviewsForService(@PathVariable String serviceId) {
        return reviewRepository.findByService_Id(Long.parseLong(serviceId));
    }

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] Authenticated principal: " + (auth != null ? auth.getName() : "null"));
        System.out.println("[DEBUG] Authorities: " + (auth != null ? auth.getAuthorities() : "null"));
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        boolean isClient = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("CLIENT") || a.getAuthority().equals("ROLE_CLIENT"));
        System.out.println("[DEBUG] isClient: " + isClient);
        if (!isClient) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can rate");
        // Fetch the User entity by email
        User user = userRepository.findByEmail(auth.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Handle null service reference
        if (review.getService() == null || review.getService().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing or invalid service reference in review payload.");
        }
        // Fetch the Service entity from DB
        glsib.stage2025.model.Service service = serviceRepository.findById(review.getService().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service not found for id: " + review.getService().getId()));
        review.setService(service);

        review.setUser(user);
        review.setReviewDate(LocalDateTime.now());
        return reviewService.saveReviewAndUpdateServiceRating(review);
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @GetMapping("/my")
    public List<Review> getMyReviews() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] Authenticated principal: " + (auth != null ? auth.getName() : "null"));
        System.out.println("[DEBUG] Authorities: " + (auth != null ? auth.getAuthorities() : "null"));
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        User user = userRepository.findByEmail(auth.getName()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return reviewRepository.findByUser_Id(user.getId());
    }
}