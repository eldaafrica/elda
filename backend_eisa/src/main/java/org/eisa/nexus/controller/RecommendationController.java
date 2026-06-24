package org.eisa.nexus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.Priorite;
import org.eisa.nexus.entity.Recommendation;
import org.eisa.nexus.entity.RecommendationTranslation;
import org.eisa.nexus.entity.Statut;
import org.eisa.nexus.entity.Theme;
import org.eisa.nexus.entity.Visibilite;
import org.eisa.nexus.service.RecommendationService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Recommendations", description = "Gestion des recommandations (back-office)")
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService service;

    @Operation(summary = "Recherche paginée et filtrée (toutes visibilités)")
    @GetMapping
    public Page<Recommendation> all(
            @RequestParam(required = false) String missionId,
            @RequestParam(required = false) String institutionId,
            @RequestParam(required = false) Theme theme,
            @RequestParam(required = false) Statut status,
            @RequestParam(required = false) Priorite priority,
            @RequestParam(required = false) Visibilite visibility,
            @RequestParam(required = false) String q,
            @ParameterObject @PageableDefault(size = 20, sort = "lastUpdate", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.search(visibility, missionId, institutionId, theme, status, priority, q, pageable);
    }

  @GetMapping("/all")
public Page<Recommendation> allReco(
        @RequestParam(required = false) Theme theme,
        @RequestParam(required = false) Statut statut,
        @RequestParam(required = false) Visibilite visibilite,
        @PageableDefault(size = 20, sort = "issuedDate")
        Pageable pageable) {

    return service.findAll(theme, statut, visibilite, pageable);
}
    @GetMapping("/{id}")
    public Recommendation one(@PathVariable String id) {
        return service.findById(id);
    }

    @GetMapping("/recents")
    public ResponseEntity<List<Recommendation>> getRecent() {
        return ResponseEntity.ok(service.findRecent());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Recommendation create(@RequestBody Recommendation r) {
        return service.create(r);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Recommendation update(@PathVariable String id, @RequestBody Recommendation r) {
        return service.update(id, r);
    }

    @Operation(summary = "Changer explicitement la visibilité")
    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Recommendation visibility(@PathVariable String id, @RequestBody Map<String, Visibilite> body) {
        return service.setVisibility(id, body.get("visibility"));
    }

    @Operation(summary = "Publier (visibilité PUBLIC)")
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Recommendation publish(@PathVariable String id) {
        return service.publish(id);
    }

    @Operation(summary = "Dépublier (visibilité INTERNAL)")
    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Recommendation unpublish(@PathVariable String id) {
        return service.unpublish(id);
    }

    @Operation(summary = "Repasser en brouillon")
    @PostMapping("/{id}/draft")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Recommendation draft(@PathVariable String id) {
        return service.toDraft(id);
    }

    @PutMapping("/{id}/translations/{lang}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Recommendation addTranslation(
            @PathVariable String id,
            @PathVariable String lang,
            @RequestBody RecommendationTranslation t) {
        return service.addTranslation(id, lang, t);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
