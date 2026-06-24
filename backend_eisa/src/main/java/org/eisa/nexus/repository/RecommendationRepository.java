package org.eisa.nexus.repository;

import org.eisa.nexus.entity.Recommendation;
import org.eisa.nexus.entity.Statut;
import org.eisa.nexus.entity.Visibilite;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository
        extends JpaRepository<Recommendation, String>, JpaSpecificationExecutor<Recommendation> {

    Optional<Recommendation> findByCode(String code);

    List<Recommendation> findByMissionId(String missionId);

    List<Recommendation> findByStatut(Statut statut);

    List<Recommendation> findByVisibilite(Visibilite visibilite);

    Page<Recommendation> findByVisibilite(Visibilite visibilite, Pageable pageable);

    List<Recommendation> findTop20ByOrderByLastUpdateDesc();

    long countByVisibilite(Visibilite visibilite);

    long countByVisibiliteAndStatut(Visibilite visibilite, Statut statut);
}
