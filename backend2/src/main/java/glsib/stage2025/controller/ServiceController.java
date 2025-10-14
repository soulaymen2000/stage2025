package glsib.stage2025.controller;

import glsib.stage2025.model.Service;
import glsib.stage2025.model.User;
import glsib.stage2025.repository.ServiceRepository;
import glsib.stage2025.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Collections;
import glsib.stage2025.repository.ReservationRepository;
import glsib.stage2025.service.RecommendationService;

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    private final ServiceRepository serviceRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private static final Logger log = LoggerFactory.getLogger(ServiceController.class);

    public ServiceController(ServiceRepository serviceRepository, ReservationRepository reservationRepository, UserRepository userRepository, RecommendationService recommendationService) {
        this.serviceRepository = serviceRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<Service> getAllServices(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Double minRating
    ) {
        // Public listing: if authenticated fournisseur, show own services; otherwise all
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<Service> services = serviceRepository.findAll();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            boolean isFournisseur = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_FOURNISSEUR") || a.getAuthority().equals("FOURNISSEUR"));
            if (isFournisseur) {
                String userEmail = auth.getName();
                User owner = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                services = serviceRepository.findByOwner_Id(owner.getId());
            }
        }
        // Apply filters
        if (category != null && !category.isEmpty()) {
            services = services.stream().filter(s -> category.equalsIgnoreCase(s.getCategory())).toList();
        }
        if (location != null && !location.isEmpty()) {
            services = services.stream().filter(s -> location.equalsIgnoreCase(s.getLocation())).toList();
        }
        if (minPrice != null) {
            services = services.stream().filter(s -> s.getPrice() >= minPrice).toList();
        }
        if (maxPrice != null) {
            services = services.stream().filter(s -> s.getPrice() <= maxPrice).toList();
        }
        if (minRating != null) {
            services = services.stream().filter(s -> s.getRating() >= minRating).toList();
        }
        return services;
    }

    @GetMapping("/{id}")
    public Service getService(@PathVariable String id) {
        // Public GET is allowed by security config
        return serviceRepository.findById(Long.parseLong(id)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
    }

    @GetMapping("/{id}/similar")
    public List<Service> getSimilarServices(@PathVariable String id) {
        Long serviceId = Long.parseLong(id);
        Service current = serviceRepository.findById(serviceId).orElse(null);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found");
        }
        List<Service> all = serviceRepository.findAll();
        return all.stream()
            .filter(s -> !s.getId().equals(serviceId))
            .map(s -> new Object[] { s, similarityScore(current, s) })
            .sorted((a, b) -> Double.compare((double) ((Object[]) b)[1], (double) ((Object[]) a)[1]))
            .limit(6)
            .map(arr -> (Service) arr[0])
            .toList();
    }

    private double similarityScore(Service a, Service b) {
        double score = 0;
        if (a.getCategory() != null && a.getCategory().equalsIgnoreCase(b.getCategory())) score += 5;
        if (a.getLocation() != null && a.getLocation().equalsIgnoreCase(b.getLocation())) score += 2;
        if (Math.abs(a.getPrice() - b.getPrice()) < 20) score += 1;
        score += b.getRating(); // bonus for higher rating
        return score;
    }

    @GetMapping("/recommendations")
    public List<Service> getPersonalizedRecommendations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<Service> allServices = serviceRepository.findAll();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return allServices.stream()
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .limit(6)
                .toList();
        }
        String userId = auth.getName();
        // Get all reservations for this user
        User user = userRepository.findByEmail(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        List<glsib.stage2025.model.Reservation> reservations = reservationRepository.findByUser_Id(user.getId());
        if (allServices.isEmpty()) {
            return List.of();
        }

        // Try ML recommendations first
        List<java.util.Map<String, Object>> catalog = allServices.stream().map(s -> {
            java.util.Map<String, Object> serviceMap = new java.util.HashMap<>();
            serviceMap.put("id", s.getId());
            serviceMap.put("title", s.getTitle() != null ? s.getTitle() : "");
            serviceMap.put("category", s.getCategory() != null ? s.getCategory() : "");
            serviceMap.put("brand", s.getBrand() != null ? s.getBrand() : "");
            serviceMap.put("price", s.getPrice());
            serviceMap.put("location", s.getLocation() != null ? s.getLocation() : "");
            serviceMap.put("rating", s.getRating());
            return serviceMap;
        }).toList();
        java.util.Map<String, Object> userProfile = new java.util.HashMap<>();
        userProfile.put("gender", user.getGender() != null ? user.getGender() : "");
        userProfile.put("age", user.getAge() != null ? user.getAge() : 0);
        List<Long> mlIds = recommendationService.getRecommendedServiceIds(user.getEmail(), userProfile, catalog);
        if (!mlIds.isEmpty()) {
            // Preserve order from ML
            java.util.Map<Long, Service> map = allServices.stream().collect(java.util.stream.Collectors.toMap(Service::getId, s -> s));
            return mlIds.stream().map(map::get).filter(java.util.Objects::nonNull).toList();
        }
        if (reservations.isEmpty()) {
            // If no history, recommend top-rated or most recent services
            return allServices.stream()
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .limit(6)
                .toList();
        }
        // Get all reserved service IDs, skip nulls
        List<Long> reservedServiceIds = reservations.stream()
            .map(r -> r.getService() != null ? r.getService().getId() : null)
            .filter(java.util.Objects::nonNull)
            .toList();
        // ML empty: fallback to rule-based using history
        List<Service> reservedServices = serviceRepository.findAllById(reservedServiceIds);
        List<String> preferredCategories = reservedServices.stream().map(Service::getCategory).distinct().toList();
        // Recommend services in preferred categories, not already reserved, sorted by rating
        List<Service> personalized = allServices.stream()
            .filter(s -> preferredCategories.contains(s.getCategory()) && !reservedServiceIds.contains(s.getId()))
            .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
            .limit(6)
            .toList();
        // If no personalized recommendations, fallback to top-rated not already reserved
        if (personalized.isEmpty()) {
            List<Service> fallback = allServices.stream()
                .filter(s -> !reservedServiceIds.contains(s.getId()))
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .limit(6)
                .toList();
            // If still empty (user has reserved all), show top-rated overall (even if already reserved)
            if (fallback.isEmpty()) {
                return allServices.stream()
                    .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                    .limit(6)
                    .toList();
            }
            return fallback;
        }
        return personalized;
    }

    @PostMapping
    public Service createService(@Valid @RequestBody Service service) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String userEmail = auth.getName();
        User owner = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        service.setOwner(owner);
        return serviceRepository.save(service);
    }

    @PutMapping("/{id}")
    public Service updateService(@PathVariable String id, @RequestBody Service service) {
        service.setId(Long.parseLong(id));
        return serviceRepository.save(service);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable String id) {
        try {
            serviceRepository.deleteById(Long.parseLong(id));
            return ResponseEntity.ok().build();
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                .body(Collections.singletonMap("message", "Impossible de supprimer ce service car il est référencé par des réservations."));
        } catch (org.springframework.dao.EmptyResultDataAccessException ex) {
            return ResponseEntity.notFound().build();
        }
    }
} 