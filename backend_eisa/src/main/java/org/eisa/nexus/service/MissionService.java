package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;

import org.eisa.nexus.entity.Mission;
import org.eisa.nexus.entity.MissionTranslation;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.MissionRepository;
import org.eisa.nexus.repository.MissionSpecs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MissionService {
    private final MissionRepository repo;

    public Page<Mission> findAll(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Page<Mission> findByInstitution(String institutionId, Pageable pageable) {
        return repo.findByInstitutionId(institutionId, pageable);
    }

    public Page<Mission> findAllFiltered(
            String institutionId,
            String country,
            Mission.Type type,
            String search,
            Pageable pageable) {

        if (search != null && search.isBlank()) search = null;
        return repo.findAll(MissionSpecs.filter(institutionId, country, type, search), pageable);
    }

    public List<Mission> findByAllMissions() {
        return repo.findAll();
    }

    public Mission findById(String id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Mission " + id));
    }

    public Mission create(Mission m) {
        m.setId(null);
        if (m.getSourceLang() == null) m.setSourceLang("fr");
        return repo.save(m);
    }

    public Mission update(String id, Mission m) {
        Mission e = findById(id);
        e.setCode(m.getCode());
        e.setType(m.getType());
        e.setCountry(m.getCountry());
        e.setCycle(m.getCycle());
        e.setStartDate(m.getStartDate());
        e.setEndDate(m.getEndDate());
        e.setLeadObserver(m.getLeadObserver());
        e.setInstitutionId(m.getInstitutionId());
        if (m.getSourceLang() != null) e.setSourceLang(m.getSourceLang());
        if (m.getTranslations() != null) e.setTranslations(m.getTranslations());
        return repo.save(e);
    }

    public Mission addTranslation(String id, String lang, MissionTranslation t) {
        Mission e = findById(id);
        e.getTranslations().put(lang, t);
        return repo.save(e);
    }

    public long countAll() {
        return repo.count();
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
