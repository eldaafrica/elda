package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.Role;
import org.eisa.nexus.entity.User;
import org.eisa.nexus.exception.ConflictException;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return repo.findAll();
    }

    public User findById(String id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("User " + id));
    }

    public User invite(String name, String email, String country, String countryCode,
            Set<Role> roles, String tempPassword) {
        if (repo.existsByEmail(email))
            throw new ConflictException("Email already exists");
        User u = User.builder()
                .name(name)
                .email(email.toLowerCase())
                .password(passwordEncoder.encode(tempPassword))
                .country(country)
                .countryCode(countryCode)
                .roles(roles == null || roles.isEmpty() ? EnumSet.of(Role.LECTEUR) : EnumSet.copyOf(roles))
                .enabled(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return repo.save(u);
    }

    public User updateRoles(String id, Set<Role> roles) {
        User u = findById(id);
        u.setRoles(EnumSet.copyOf(roles));
        u.setUpdatedAt(Instant.now());
        return repo.save(u);
    }

    public User update(String id, String name, String country, String countryCode) {
        User u = findById(id);
        if (name != null)
            u.setName(name);
        if (country != null)
            u.setCountry(country);
        if (countryCode != null)
            u.setCountryCode(countryCode);
        u.setUpdatedAt(Instant.now());
        return repo.save(u);
    }

    public User enable(String id) {
        User u = findById(id);

        u.setEnabled(true);
        u.setUpdatedAt(Instant.now());

        return repo.save(u);
    }

    public User disable(String id) {
        User u = findById(id);

        u.setEnabled(false);
        u.setUpdatedAt(Instant.now());

        return repo.save(u);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
