package glsib.stage2025.service;

import glsib.stage2025.model.Role;
import glsib.stage2025.model.User;
import glsib.stage2025.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User save(User user) {
        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public List<User> getAllByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> searchByName(String keyword) {
        return userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword);
    }

    public Page<User> getPagedUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
