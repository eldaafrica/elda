package org.eisa.nexus.repository;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.MapJoin;
import org.eisa.nexus.entity.Priorite;
import org.eisa.nexus.entity.Recommendation;
import org.eisa.nexus.entity.RecommendationTranslation;
import org.eisa.nexus.entity.Statut;
import org.eisa.nexus.entity.Theme;
import org.eisa.nexus.entity.Visibilite;
import org.springframework.data.jpa.domain.Specification;

public final class RecommendationSpecs {

    private RecommendationSpecs() {}

    public static Specification<Recommendation> byVisibilite(Visibilite v) {
        return (root, q, cb) -> cb.equal(root.get("visibilite"), v);
    }

    public static Specification<Recommendation> byTheme(Theme t) {
        return (root, q, cb) -> cb.equal(root.get("theme"), t);
    }

    public static Specification<Recommendation> byStatut(Statut s) {
        return (root, q, cb) -> cb.equal(root.get("statut"), s);
    }

    public static Specification<Recommendation> byMission(String missionId) {
        return (root, q, cb) -> cb.equal(root.get("missionId"), missionId);
    }

    public static Specification<Recommendation> byInstitution(String institutionId) {
        return (root, q, cb) -> cb.equal(root.get("institutionId"), institutionId);
    }

    public static Specification<Recommendation> byPriorite(Priorite p) {
        return (root, q, cb) -> cb.equal(root.get("priorite"), p);
    }

    public static Specification<Recommendation> byCodeCountry(String code) {
        return (root, q, cb) -> cb.equal(root.get("codeCountry"), code);
    }

    /** Full-text-like search on code and all translation title/summary values. */
    public static Specification<Recommendation> byKeyword(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase().trim() + "%";
            MapJoin<Recommendation, String, RecommendationTranslation> t =
                    root.joinMap("translations", JoinType.LEFT);
            query.distinct(true);
            return cb.or(
                    cb.like(cb.lower(root.get("code")), pattern),
                    cb.like(cb.lower(t.value().<String>get("title")), pattern),
                    cb.like(cb.lower(t.value().<String>get("summary")), pattern)
            );
        };
    }

    public static Specification<Recommendation> buildSearch(
            Visibilite visibilite,
            String missionId,
            String institutionId,
            String codeCountry,
            Theme theme,
            Statut statut,
            Priorite priorite,
            String q) {

        Specification<Recommendation> spec = Specification.where(null);

        if (visibilite != null)    spec = spec.and(byVisibilite(visibilite));
        if (missionId != null)     spec = spec.and(byMission(missionId));
        if (institutionId != null) spec = spec.and(byInstitution(institutionId));
        if (codeCountry != null)   spec = spec.and(byCodeCountry(codeCountry));
        if (theme != null)         spec = spec.and(byTheme(theme));
        if (statut != null)        spec = spec.and(byStatut(statut));
        if (priorite != null)      spec = spec.and(byPriorite(priorite));
        if (q != null && !q.isBlank()) spec = spec.and(byKeyword(q));

        return spec;
    }
}
