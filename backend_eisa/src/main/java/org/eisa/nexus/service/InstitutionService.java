package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;

import org.eisa.nexus.entity.Country;
import org.eisa.nexus.entity.Institution;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.InstitutionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository repo;

    // ================= LIST =================

    public Page<Institution> findAll(
            String country,
            Institution.Category category,
            Pageable pageable) {

        // ✅ NORMALISATION MAJUSCULE
        String normalizedCountry = null;

        if (country != null && !country.isBlank()) {
            normalizedCountry = country.trim().toUpperCase();
        }

        if (normalizedCountry != null && category != null) {
            return repo.findByCountryAndCategory(
                    normalizedCountry,
                    category,
                    pageable);
        }

        if (normalizedCountry != null) {
            return repo.findByCountry(
                    normalizedCountry,
                    pageable);
        }

        if (category != null) {
            return repo.findByCategory(
                    category,
                    pageable);
        }

        return repo.findAll(pageable);
    }
    // public Page<Institution> findAll(
    // String country,
    // Pageable pageable
    // ) {

    // if (country != null && !country.isBlank()) {
    // return repo.findByCountry(country, pageable);
    // }

    // return repo.findAll(pageable);
    // }

    public List<Institution> findByAllInstitutions() {
        return repo.findAll();
    }

    // ================= GET =================

    public Institution findById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new NotFoundException(
                        "Institution " + id));
    }

    // ================= CREATE =================

    public Institution create(Institution i) {
        i.setId(null);
        if (i.getSourceLang() == null) i.setSourceLang("fr");
        syncName(i);
        return repo.save(i);
    }

    // ================= UPDATE =================

    public Institution update(String id, Institution i) {
        Institution existing = findById(id);
        existing.setCountry(i.getCountry());
        existing.setCategory(i.getCategory());
        if (i.getSourceLang() != null) existing.setSourceLang(i.getSourceLang());
        if (i.getTranslations() != null) existing.setTranslations(i.getTranslations());
        syncName(existing);
        return repo.save(existing);
    }

    // ================= TRANSLATION =================

    public Institution addTranslation(String id, String lang, String name) {
        Institution existing = findById(id);
        existing.getTranslations().put(lang, name);
        syncName(existing);
        return repo.save(existing);
    }

    // ================= DELETE =================

    public void delete(String id) {
        repo.deleteById(id);
    }

    /** Keep the legacy name column in sync with translations[sourceLang]. */
    private void syncName(Institution i) {
        String primary = i.getTranslations() == null ? null
                : i.getTranslations().get(i.getSourceLang());
        if (primary != null && !primary.isBlank()) i.setName(primary);
    }
}