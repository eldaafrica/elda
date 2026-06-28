package org.eisa.nexus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.SiteParam;
import org.eisa.nexus.service.SiteParamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Site Params", description = "Paramètres dynamiques du site (page À propos, etc.)")
@RestController
@RequestMapping("/api/site-params")
@RequiredArgsConstructor
public class SiteParamController {

    private final SiteParamService service;

    @Operation(summary = "Lister tous les paramètres")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public List<SiteParam> all() {
        return service.findAll();
    }

    @Operation(summary = "Sauvegarder les traductions d'une clé (body: { fr: '...', en: '...' })")
    @PutMapping("/{key}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public SiteParam upsert(
            @PathVariable String key,
            @RequestBody Map<String, String> translations) {
        return service.upsertAll(key, translations);
    }

    @Operation(summary = "Supprimer une clé")
    @DeleteMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String key) {
        service.delete(key);
        return ResponseEntity.noContent().build();
    }
}
