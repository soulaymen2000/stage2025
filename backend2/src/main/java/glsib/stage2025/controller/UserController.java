package glsib.stage2025.controller;

import glsib.stage2025.model.Role;
import glsib.stage2025.model.User;
import glsib.stage2025.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.validation.BindingResult;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody User user, BindingResult result) {
        if (result.hasErrors()) return ResponseEntity.badRequest().body(result.getAllErrors());
        if (userService.existsByEmail(user.getEmail()))
            return ResponseEntity.badRequest().body("Email déjà utilisé");
        return ResponseEntity.ok(userService.save(user));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getAllByRole(role));
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchByName(@RequestParam String keyword) {
        return ResponseEntity.ok(userService.searchByName(keyword));
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<User>> getPaged(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(userService.getPagedUsers(page, size));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Utilisateur supprimé");
    }
}
