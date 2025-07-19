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

@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired
    private ServiceRepository serviceRepository;

    @GetMapping
    public List<Service> getAllServices() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return List.of();
        boolean isFournisseur = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("FOURNISSEUR") || a.getAuthority().equals("ROLE_FOURNISSEUR"));
        if (isFournisseur) {
            String userId = auth.getName();
            return serviceRepository.findByOwnerId(userId);
        } else {
            // For clients and others, return all services
            return serviceRepository.findAll();
        }
    }

    @GetMapping("/{id}")
    public Service getService(@PathVariable String id) {
        return serviceRepository.findById(id).orElse(null);
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