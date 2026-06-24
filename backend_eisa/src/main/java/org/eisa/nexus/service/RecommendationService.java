package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.Priorite;
import org.eisa.nexus.entity.Recommendation;
import org.eisa.nexus.entity.RecommendationTranslation;
import org.eisa.nexus.entity.Statut;
import org.eisa.nexus.entity.Theme;
import org.eisa.nexus.entity.Visibilite;
import org.eisa.nexus.exception.ConflictException;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.RecommendationRepository;
import org.eisa.nexus.repository.RecommendationSpecs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository repo;

    @Transactional(readOnly = true)
    public Page<Recommendation> findAll(
            Theme theme, Statut statut, Visibilite visibilite, Pageable pageable) {
        return repo.findAll(
                RecommendationSpecs.buildSearch(visibilite, null, null, theme, statut, null, null),
                pageable);
    }

    @Transactional(readOnly = true)
    public List<Recommendation> findRecent() {
        return repo.findTop20ByOrderByLastUpdateDesc();
    }

    @Transactional(readOnly = true)
    public Page<Recommendation> searchPublic(
            String missionId, String institutionId,
            Theme theme, Statut status, Priorite priority,
            String q, Pageable pageable) {
        return repo.findAll(
                RecommendationSpecs.buildSearch(
                        Visibilite.PUBLIC, missionId, institutionId, theme, status, priority, q),
                pageable);
    }

    @Transactional(readOnly = true)
    public Page<Recommendation> search(
            Visibilite visibility, String missionId, String institutionId,
            Theme theme, Statut status, Priorite priority,
            String q, Pageable pageable) {
        return repo.findAll(
                RecommendationSpecs.buildSearch(
                        visibility, missionId, institutionId, theme, status, priority, q),
                pageable);
    }

    @Transactional(readOnly = true)
    public List<Recommendation> findPublic() {
        return repo.findByVisibilite(Visibilite.PUBLIC);
    }

    @Transactional(readOnly = true)
    public List<Recommendation> findByMission(String missionId) {
        return repo.findByMissionId(missionId);
    }

    @Transactional(readOnly = true)
    public Recommendation findById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Recommendation " + id));
    }

    @Transactional(readOnly = true)
    public long countPublic() {
        return repo.countByVisibilite(Visibilite.PUBLIC);
    }

    @Transactional(readOnly = true)
    public long countPublicImplemented() {
        return repo.countByVisibiliteAndStatut(Visibilite.PUBLIC, Statut.IMPLEMENTE);
    }

    @Transactional
    public Recommendation create(Recommendation r) {
        if (repo.findByCode(r.getCode()).isPresent()) {
            throw new ConflictException("Le code " + r.getCode() + " est déjà utilisé.");
        }
        r.setId(null);
        if (r.getSourceLang() == null) r.setSourceLang("fr");
        if (r.getStatut() == null)     r.setStatut(Statut.NOUVEAU);
        if (r.getVisibilite() == null) r.setVisibilite(Visibilite.BROUILLON);
        if (r.getIssuedDate() == null) r.setIssuedDate(LocalDate.now());
        r.setLastUpdate(LocalDate.now());
        return repo.save(r);
    }

    @Transactional
    public Recommendation update(String id, Recommendation r) {
        Recommendation e = findById(id);
        e.setCode(r.getCode());
        if (r.getSourceLang() != null) e.setSourceLang(r.getSourceLang());
        if (r.getTranslations() != null) e.setTranslations(r.getTranslations());
        e.setMissionId(r.getMissionId());
        e.setInstitutionId(r.getInstitutionId());
        e.setTheme(r.getTheme());
        e.setStatut(r.getStatut());
        e.setPriorite(r.getPriorite());
        if (r.getVisibilite() != null) e.setVisibilite(r.getVisibilite());
        e.setIssuedDate(r.getIssuedDate());
        e.setSources(r.getSources());
        e.setCodeCountry(r.getCodeCountry());
        e.setLastUpdate(LocalDate.now());
        return repo.save(e);
    }

    @Transactional
    public Recommendation addTranslation(String id, String lang, RecommendationTranslation t) {
        Recommendation e = findById(id);
        e.getTranslations().put(lang, t);
        e.setLastUpdate(LocalDate.now());
        return repo.save(e);
    }

    @Transactional
    public Recommendation setVisibility(String id, Visibilite v) {
        Recommendation e = findById(id);
        e.setVisibilite(v);
        e.setLastUpdate(LocalDate.now());
        return repo.save(e);
    }

    @Transactional
    public Recommendation publish(String id)   { return setVisibility(id, Visibilite.PUBLIC);    }

    @Transactional
    public Recommendation unpublish(String id) { return setVisibility(id, Visibilite.INTERNE);   }

    @Transactional
    public Recommendation toDraft(String id)   { return setVisibility(id, Visibilite.BROUILLON); }

    @Transactional
    public void delete(String id) {
        repo.deleteById(id);
    }
}
