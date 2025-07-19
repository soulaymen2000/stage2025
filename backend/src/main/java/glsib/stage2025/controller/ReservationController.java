package glsib.stage2025.controller;

import glsib.stage2025.model.Reservation;
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

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservation) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        boolean isClient = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("CLIENT") || a.getAuthority().equals("ROLE_CLIENT"));
        if (!isClient) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only clients can reserve");
        String userId = auth.getName();
        // Prevent duplicate reservation for the same service and user
        boolean alreadyReserved = reservationRepository.findAll().stream()
            .anyMatch(r -> userId.equals(r.getUserId()) && reservation.getServiceId().equals(r.getServiceId()));
        if (alreadyReserved) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous avez déjà réservé ce service.");
        }
        reservation.setUserId(userId);
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setStatus("PENDING");
        return reservationRepository.save(reservation);
    }

    @GetMapping("/my")
    public List<Reservation> getMyReservations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        System.out.println("Authorities: " + auth.getAuthorities());
        String userId = auth.getName();
        System.out.println("Authenticated userId: " + userId);
        List<Reservation> all = reservationRepository.findAll();
        for (Reservation r : all) {
            System.out.println("Reservation userId: " + r.getUserId());
        }
        return all.stream()
            .filter(r -> userId.equals(r.getUserId()))
            .toList();
    }
} 