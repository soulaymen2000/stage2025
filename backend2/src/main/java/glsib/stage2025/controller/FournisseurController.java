package glsib.stage2025.controller;

import glsib.stage2025.dto.ReservationDetailDto;
import glsib.stage2025.dto.StatsDto;
import glsib.stage2025.model.Reservation;
import glsib.stage2025.model.Service;
import glsib.stage2025.model.User;
import glsib.stage2025.repository.ReservationRepository;
import glsib.stage2025.repository.ServiceRepository;
import glsib.stage2025.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fournisseur")
@PreAuthorize("hasRole('FOURNISSEUR')")
public class FournisseurController {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public StatsDto getStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User owner = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        List<Service> services = serviceRepository.findByOwner_Id(owner.getId());
        if (services.isEmpty()) {
            return new StatsDto(0, 0, 0);
        }

        List<Long> serviceIds = services.stream().map(Service::getId).collect(Collectors.toList());
        // Only count CONFIRMED reservations for revenue calculation
        List<Reservation> reservations = reservationRepository.findByService_IdInAndStatus(serviceIds, "CONFIRMED");

        double totalRevenue = reservations.stream()
                .map(r -> services.stream().filter(s -> s.getId().equals(r.getService().getId())).findFirst().orElse(null))
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Service::getPrice)
                .sum();

        // Count all reservations for totalReservations
        List<Reservation> allReservations = reservationRepository.findByService_IdIn(serviceIds);
        long totalReservations = allReservations.size();

        double averageRating = services.stream()
                .mapToDouble(Service::getRating)
                .average()
                .orElse(0.0);

        return new StatsDto(totalRevenue, totalReservations, Math.round(averageRating * 10.0) / 10.0);
    }

    @GetMapping("/reservations")
    public List<ReservationDetailDto> getReservations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User owner = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        List<Service> services = serviceRepository.findByOwner_Id(owner.getId());
        if (services.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, Service> serviceMap = services.stream()
                .collect(Collectors.toMap(Service::getId, Function.identity()));

        List<Reservation> reservations = reservationRepository.findByService_IdIn(List.copyOf(serviceMap.keySet()));

        List<Long> clientIds = reservations.stream().map(r -> r.getUser().getId()).distinct().collect(Collectors.toList());
        Map<Long, User> clientMap = userRepository.findAllById(clientIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return reservations.stream()
                .map(r -> {
                    Service service = serviceMap.get(r.getService().getId());
                    User client = clientMap.get(r.getUser().getId());
                    String clientName = client != null ? client.getFirstName() + " " + client.getLastName() : "Client inconnu";
                    ReservationDetailDto dto = new ReservationDetailDto(
                            r.getId(), // This is a Long
                            service.getTitle(),
                            clientName,
                            client != null ? client.getId() : null,
                            r.getReservationDate(),
                            r.getStatus(),
                            service.getPrice()
                    );
                    System.out.println("Sending reservation DTO: " + dto.getReservationId() + ", service: " + dto.getServiceName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Add endpoint to update reservation status
    @PutMapping("/reservations/{reservationId}/status")
    public Reservation updateReservationStatus(@PathVariable Long reservationId, @RequestBody Map<String, String> payload) {
        System.out.println("Received request to update reservation " + reservationId + " status");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User owner = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        // Check if the reservation belongs to a service owned by this fournisseur
        if (!reservation.getService().getOwner().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this reservation");
        }

        String newStatus = payload.get("status");
        System.out.println("New status: " + newStatus);
        if (newStatus == null || (!newStatus.equals("PENDING") && !newStatus.equals("CONFIRMED") && !newStatus.equals("CANCELLED"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        reservation.setStatus(newStatus);
        Reservation saved = reservationRepository.save(reservation);
        System.out.println("Reservation status updated successfully");
        return saved;
    }
}