package org.eisa.nexus.controller;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.Role;
import org.eisa.nexus.entity.User;
import org.eisa.nexus.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService service;

    @GetMapping
    public List<User> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public User one(@PathVariable String id) {
        return service.findById(id);
    }

    public record InviteRequest(String name, String email, String country, String countryCode,
            Set<Role> roles, String tempPassword) {
    }

    @PostMapping("/invite")
    public User invite(@RequestBody InviteRequest r) {
        return service.invite(r.name(), r.email(), r.country(), r.countryCode(), r.roles(), r.tempPassword());
    }

    @PatchMapping("/{id}/roles")
    public User roles(@PathVariable String id, @RequestBody Map<String, Set<Role>> body) {
        return service.updateRoles(id, body.get("roles"));
    }

    @PatchMapping("/{id}")
    public User update(@PathVariable String id, @RequestBody Map<String, String> body) {
        return service.update(id, body.get("name"), body.get("country"), body.get("countryCode"));
    }

    @PatchMapping("/{id}/enable")
    public User enable(@PathVariable String id) {
        return service.enable(id);
    }

    @PatchMapping("/{id}/disable")
    public User disable(@PathVariable String id) {
        return service.disable(id);
    }

    @PatchMapping("/{id}/toggle")
    public User toggle(@PathVariable String id) {
        User u = service.findById(id);

        if (u.isEnabled()) {
            return service.disable(id);
        }

        return service.enable(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
