package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.FollowUp;
import org.eisa.nexus.entity.Recommendation;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.FollowUpRepository;
import org.eisa.nexus.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowUpService {
    private final FollowUpRepository repo;
    private final RecommendationRepository recoRepo;

    public List<FollowUp> findAll() {
        return repo.findAllByOrderByDateDesc();
    }

    public List<FollowUp> findByRecommendation(String recId) {
        return repo.findByRecommendationIdOrderByDateDesc(recId);
    }

    public FollowUp findById(String id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("FollowUp " + id));
    }

    public FollowUp create(FollowUp f) {
        Recommendation r = recoRepo.findById(f.getRecommendationId())
                .orElseThrow(() -> new NotFoundException("Recommendation " + f.getRecommendationId()));
        f.setId(null);
        if (f.getDate() == null)
            f.setDate(LocalDate.now());
        FollowUp saved = repo.save(f);
        // propagate status & lastUpdate on parent recommendation
        r.setStatut(f.getStatut());
        r.setLastUpdate(f.getDate());
        recoRepo.save(r);
        return saved;
    }

    public FollowUp update(String id, FollowUp f) {
        FollowUp e = findById(id);
        e.setDate(f.getDate());
        e.setStatut(f.getStatut());
        e.setAuthor(f.getAuthor());
        if (f.getSourceLang() != null) e.setSourceLang(f.getSourceLang());
        if (f.getTranslations() != null) e.setTranslations(f.getTranslations());
        return repo.save(e);
    }

    public FollowUp addTranslation(String id, String lang, String note) {
        FollowUp e = findById(id);
        e.getTranslations().put(lang, note);
        return repo.save(e);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
