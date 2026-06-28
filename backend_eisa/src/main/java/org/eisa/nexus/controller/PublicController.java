package org.eisa.nexus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.*;
import org.eisa.nexus.service.CountryService;
import org.eisa.nexus.service.FollowUpService;
import org.eisa.nexus.service.InstitutionService;
import org.eisa.nexus.service.MissionService;
import org.eisa.nexus.service.RecommendationService;
import org.eisa.nexus.service.SiteParamService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Public Portal", description = "Endpoints publics (recommandations publiées)")
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final RecommendationService recommendationService;
    private final MissionService missionService;
    private final InstitutionService institutionService;
    private final FollowUpService followUpService;
    private final CountryService countryService;
    private final SiteParamService siteParamService;

    @Operation(summary = "Récupérer une recommandation publique par ID")
    @GetMapping("/recommendations/{id}")
    public Recommendation publicRecommendationById(@PathVariable String id) {
        return recommendationService.findPublicById(id);
    }

    @Operation(summary = "Lister les recommandations publiées avec filtres et pagination")
    @GetMapping("/recommendations")
    public Page<Recommendation> publicRecommendations(
            @Parameter(description = "ID mission") @RequestParam(required = false) String missionId,
            @Parameter(description = "ID institution") @RequestParam(required = false) String institutionId,
            @RequestParam(required = false) Theme theme,
            @RequestParam(required = false) Statut statut,
            @RequestParam(required = false) Priorite priorite,
            @Parameter(description = "Recherche texte (titre, résumé, code)") @RequestParam(required = false) String q,
            @ParameterObject @PageableDefault(size = 20, sort = "lastUpdate", direction = Sort.Direction.DESC) Pageable pageable) {
        return recommendationService.searchPublic(missionId, institutionId, theme, statut, priorite, q, pageable);
    }

    @Operation(summary = "Statistiques globales du portail public")
    @GetMapping("/stats")
    public Map<String, Long> stats() {
        long totalRecommendations = recommendationService.countPublic();
        long implementedRecommendations = recommendationService.countPublicImplemented();
        long totalMissions = missionService.countAll();
        long totalCountries = countryService.countAll();
        return Map.of(
                "totalRecommendations", totalRecommendations,
                "implementedRecommendations", implementedRecommendations,
                "totalMissions", totalMissions,
                "totalCountries", totalCountries
        );
    }

    @Operation(summary = "Récupérer une mission par ID (portail public)")
    @GetMapping("/missions/{id}")
    public Mission publicMissionById(@PathVariable String id) {
        return missionService.findById(id);
    }

    @Operation(summary = "Récupérer une institution par ID (portail public)")
    @GetMapping("/institutions/{id}")
    public Institution publicInstitutionById(@PathVariable String id) {
        return institutionService.findById(id);
    }

    @Operation(summary = "Suivis d'une recommandation publique")
    @GetMapping("/recommendations/{id}/followups")
    public List<FollowUp> publicFollowUps(@PathVariable String id) {
        return followUpService.findByRecommendation(id);
    }

    @Operation(summary = "Lister toutes les missions (portail public)")
    @GetMapping("/missions")
    public Page<Mission> publicMissions(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Mission.Type type,
            @ParameterObject @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return missionService.findAllFiltered(null, country, type, null, pageable);
    }

    @Operation(summary = "Lister tous les pays (portail public)")
    @GetMapping("/countries")
    public List<Country> publicCountries() {
        return countryService.findByAllCountry();
    }

    @Operation(summary = "Paramètres dynamiques du site (page À propos, etc.)")
    @GetMapping("/site-params")
    public java.util.Map<String, java.util.Map<String, String>> publicSiteParams() {
        java.util.Map<String, java.util.Map<String, String>> result = new java.util.LinkedHashMap<>();
        siteParamService.findAll().forEach(p -> result.put(p.getParamKey(), p.getTranslations()));
        return result;
    }
}
