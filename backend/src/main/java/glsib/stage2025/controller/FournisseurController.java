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
        String userId = auth.getName();

        List<Service> services = serviceRepository.findByOwnerId(userId);
        if (services.isEmpty()) {
            return new StatsDto(0, 0, 0);
        }

        List<String> serviceIds = services.stream().map(Service::getId).collect(Collectors.toList());
        List<Reservation> reservations = reservationRepository.findByServiceIdIn(serviceIds);

        double totalRevenue = reservations.stream()
                .map(r -> services.stream().filter(s -> s.getId().equals(r.getServiceId())).findFirst().orElse(null))
                .filter(java.util.Objects::nonNull)
                .mapToDouble(Service::getPrice)
                .sum();

        long totalReservations = reservations.size();

        double averageRating = services.stream()
                .mapToDouble(Service::getRating)
                .average()
                .orElse(0.0);

        return new StatsDto(totalRevenue, totalReservations, Math.round(averageRating * 10.0) / 10.0);
    }

    @GetMapping("/reservations")
    public List<ReservationDetailDto> getReservations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        List<Service> services = serviceRepository.findByOwnerId(userId);
        if (services.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Service> serviceMap = services.stream()
                .collect(Collectors.toMap(Service::getId, Function.identity()));

        List<Reservation> reservations = reservationRepository.findByServiceIdIn(List.copyOf(serviceMap.keySet()));

        List<String> clientIds = reservations.stream().map(Reservation::getUserId).distinct().collect(Collectors.toList());
        Map<String, User> clientMap = userRepository.findAllById(clientIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return reservations.stream()
                .map(r -> {
                    Service service = serviceMap.get(r.getServiceId());
                    User client = clientMap.get(r.getUserId());
                    String clientName = client != null ? client.getFirstName() + " " + client.getLastName() : "Client inconnu";
                    return new ReservationDetailDto(
                            r.getId(),
                            service.getTitle(),
                            clientName,
                            r.getReservationDate(),
                            r.getStatus(),
                            service.getPrice()
                    );
                })
                .collect(Collectors.toList());
    }
} 