package org.eisa.nexus.controller;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.Institution;
import org.eisa.nexus.service.InstitutionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService service;

    // ================= LIST =================

    @GetMapping
    public Page<Institution> all(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Institution.Category category,

            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return service.findAll(country, category, pageable);
    }

    @GetMapping("/all")
    public List<Institution> getAll() {
        return service.findByAllInstitutions();
    }
    
    // ================= GET =================

    @GetMapping("/{id}")
    public Institution one(
            @PathVariable String id) {
        return service.findById(id);
    }

    // ================= CREATE =================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Institution create(
            @RequestBody Institution i) {
        return service.create(i);
    }

    // ================= UPDATE =================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Institution update(
            @PathVariable String id,
            @RequestBody Institution i) {

        return service.update(id, i);
    }

    // ================= TRANSLATION =================

    @PutMapping("/{id}/translations/{lang}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Institution addTranslation(
            @PathVariable String id,
            @PathVariable String lang,
            @RequestBody Map<String, String> body) {
        return service.addTranslation(id, lang, body.get("name"));
    }

    // ================= DELETE =================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(
            @PathVariable String id) {
        service.delete(id);
    }
}