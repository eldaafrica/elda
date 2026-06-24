package org.eisa.nexus.controller;

import lombok.RequiredArgsConstructor;

import org.eisa.nexus.dto.PageResponse;
import org.eisa.nexus.entity.Country;
import org.eisa.nexus.entity.Region;
import org.eisa.nexus.service.CountryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {

    private final CountryService service;

    // ================= GET ALL (PAGINATED) =================
    @GetMapping
    public PageResponse<Country> all(
            @RequestParam(required = false) Region region,
            Pageable pageable
    ) {
        return service.findAll(region, pageable);
    }

        // ================= GET ALL =================
    @GetMapping("/all")
    public List<Country> all() {
        return service.findByAllCountry();
    }
    
    // ================= GET ONE =================
    @GetMapping("/{code}")
    public Country one(@PathVariable String code) {
        return service.findByCode(code);
    }

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Country create(@RequestBody Country country) {
        return service.create(country);
    }

    // ================= UPDATE =================
    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Country update(
            @PathVariable String code,
            @RequestBody Country country
    ) {
        return service.update(code, country);
    }

    // ================= ADD TRANSLATION =================
    @PutMapping("/{code}/translations/{lang}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Country addTranslation(
            @PathVariable String code,
            @PathVariable String lang,
            @RequestBody Map<String, String> body) {
        return service.addTranslation(code, lang, body.get("name"));
    }

    // ================= DELETE =================
    @DeleteMapping("/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String code) {
        service.delete(code);
    }
}