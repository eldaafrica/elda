package org.eisa.nexus.controller;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.FollowUp;
import org.eisa.nexus.service.FollowUpService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow-ups")
@RequiredArgsConstructor
public class FollowUpController {

    private final FollowUpService service;

    @GetMapping public List<FollowUp> all(@RequestParam(required = false) String recommendationId) {
        return recommendationId != null
                ? service.findByRecommendation(recommendationId)
                : service.findAll();
    }

    @GetMapping("/{id}") public FollowUp one(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public FollowUp create(@RequestBody FollowUp f) { return service.create(f); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public FollowUp update(@PathVariable String id, @RequestBody FollowUp f) { return service.update(id, f); }

    @PutMapping("/{id}/translations/{lang}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public FollowUp addTranslation(
            @PathVariable String id,
            @PathVariable String lang,
            @RequestBody Map<String, String> body) {
        return service.addTranslation(id, lang, body.getOrDefault("note", ""));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) { service.delete(id); }
}
