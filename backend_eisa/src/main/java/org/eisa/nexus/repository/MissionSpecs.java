package org.eisa.nexus.repository;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.MapJoin;
import jakarta.persistence.criteria.Predicate;
import org.eisa.nexus.entity.Mission;
import org.eisa.nexus.entity.MissionTranslation;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class MissionSpecs {

    private MissionSpecs() {}

    public static Specification<Mission> filter(
            String institutionId,
            String country,
            Mission.Type type,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (institutionId != null) {
                predicates.add(cb.equal(root.get("institutionId"), institutionId));
            }
            if (country != null) {
                predicates.add(cb.equal(cb.lower(root.get("country")), country.toLowerCase()));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase().trim() + "%";
                MapJoin<Mission, String, MissionTranslation> t =
                        root.joinMap("translations", JoinType.LEFT);
                query.distinct(true);
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern),
                        cb.like(cb.lower(root.get("cycle")), pattern),
                        cb.like(cb.lower(t.value().<String>get("summary")), pattern)
                ));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
