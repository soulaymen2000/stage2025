package glsib.stage2025.controller;

import glsib.stage2025.model.Reservation;
import glsib.stage2025.model.User;
import glsib.stage2025.repository.ReservationRepository;
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
@RequestMapping("/api/reservations")
public class ReservationController {
    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private glsib.stage2025.repository.UserRepository userRepository;
    @Autowired
    private glsib.stage2025.repository.ServiceRepository serviceRepository;

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservation) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] Authenticated principal: " + (auth != null ? auth.getName() : "null"));
        System.out.println("[DEBUG] Authorities: " + (auth != null ? auth.getAuthorities() : "null"));
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        boolean isClient = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("CLIENT") || a.getAuthority().equals("ROLE_CLIENT"));
        System.out.println("[DEBUG] isClient: " + isClient);
        if (!isClient) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can reserve");
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Handle null service reference FIRST
        if (reservation.getService() == null || reservation.getService().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing or invalid service reference in reservation payload.");
        }
        // Fetch the Service entity from DB and assign to reservation
        glsib.stage2025.model.Service service = serviceRepository.findById(reservation.getService().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service not found for id: " + reservation.getService().getId()));
        reservation.setService(service);

        // Prevent duplicate reservation for the same service and user (use fetched service)
        boolean alreadyReserved = reservationRepository.findAll().stream()
            .anyMatch(r -> r.getUser() != null && r.getUser().getId().equals(user.getId()) &&
                r.getService() != null && r.getService().getId().equals(service.getId()));
        if (alreadyReserved) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà réservé ce service.");
        }
        reservation.setUser(user);
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setStatus("PENDING");
        return reservationRepository.save(reservation);
    }

    @GetMapping("/my")
    public List<ReservationDTO> getMyReservations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        String userEmail = auth.getName();
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        List<Reservation> reservations = reservationRepository.findByUserIdWithService(user.getId());
        // Map to DTOs to ensure all fields are present and avoid proxy issues
        return reservations.stream().map(ReservationDTO::fromEntity).toList();
    }

    // DTO for reservation with service details
    public static class ReservationDTO {
        public Long id;
        public String status;
        public String reservationDate;
        public ServiceDTO service;

        public static ReservationDTO fromEntity(Reservation r) {
            ReservationDTO dto = new ReservationDTO();
            dto.id = r.getId();
            dto.status = r.getStatus();
            dto.reservationDate = r.getReservationDate() != null ? r.getReservationDate().toString() : null;
            dto.service = r.getService() != null ? ServiceDTO.fromEntity(r.getService()) : null;
            return dto;
        }
    }

    public static class ServiceDTO {
        public Long id;
        public String title;
        public String description;
        public String category;
        public double price;
        public String location;
        public double rating;

        public static ServiceDTO fromEntity(glsib.stage2025.model.Service s) {
            ServiceDTO dto = new ServiceDTO();
            dto.id = s.getId();
            dto.title = s.getTitle();
            dto.description = s.getDescription();
            dto.category = s.getCategory();
            dto.price = s.getPrice();
            dto.location = s.getLocation();
            dto.rating = s.getRating();
            return dto;
        }
    }
}