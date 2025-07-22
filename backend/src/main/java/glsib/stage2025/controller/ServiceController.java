package glsib.stage2025.controller;

import glsib.stage2025.model.Service;
import glsib.stage2025.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import glsib.stage2025.repository.ReservationRepository;

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @GetMapping
    public List<Service> getAllServices(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Double minRating
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return List.of();
        boolean isFournisseur = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("FOURNISSEUR") || a.getAuthority().equals("ROLE_FOURNISSEUR"));
        List<Service> services;
        if (isFournisseur) {
            String userId = auth.getName();
            services = serviceRepository.findByOwnerId(userId);
        } else {
            services = serviceRepository.findAll();
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
        return serviceRepository.findById(id).orElse(null);
    }

    @GetMapping("/{id}/similar")
    public List<Service> getSimilarServices(@PathVariable String id) {
        Service current = serviceRepository.findById(id).orElse(null);
        if (current == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found");
        }
        List<Service> all = serviceRepository.findAll();
        return all.stream()
            .filter(s -> !s.getId().equals(id))
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
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        String userId = auth.getName();
        // Get all reservations for this user
        List<glsib.stage2025.model.Reservation> reservations = reservationRepository.findByUserId(userId);
        if (reservations.isEmpty()) {
            // If no history, recommend top-rated or most recent services
            return serviceRepository.findAll().stream()
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .limit(6)
                .toList();
        }
        // Get all reserved service IDs
        List<String> reservedServiceIds = reservations.stream().map(glsib.stage2025.model.Reservation::getServiceId).toList();
        // Get reserved services to extract preferred categories
        List<Service> reservedServices = serviceRepository.findAllById(reservedServiceIds);
        List<String> preferredCategories = reservedServices.stream().map(Service::getCategory).distinct().toList();
        // Recommend services in preferred categories, not already reserved, sorted by rating
        return serviceRepository.findAll().stream()
            .filter(s -> preferredCategories.contains(s.getCategory()) && !reservedServiceIds.contains(s.getId()))
            .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
            .limit(6)
            .toList();
    }

    @PostMapping
    public Service createService(@RequestBody Service service) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = (auth != null) ? auth.getName() : null;
        System.out.println("[DEBUG] Tentative de création de service par : " + userId);
        if (auth != null) {
            System.out.println("[DEBUG] Rôles de l'utilisateur :");
            for (GrantedAuthority authority : auth.getAuthorities()) {
                System.out.println("[DEBUG] - " + authority.getAuthority());
            }
        }
        boolean isFournisseur = auth != null && auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("FOURNISSEUR") || a.getAuthority().equals("ROLE_FOURNISSEUR"));
        if (!isFournisseur) {
            System.out.println("[DEBUG] Accès refusé : utilisateur non fournisseur");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seuls les fournisseurs peuvent créer un service");
        }
        service.setOwnerId(userId);
        return serviceRepository.save(service);
    }

    @PutMapping("/{id}")
    public Service updateService(@PathVariable String id, @RequestBody Service service) {
        service.setId(id);
        return serviceRepository.save(service);
    }

    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable String id) {
        serviceRepository.deleteById(id);
    }
} 