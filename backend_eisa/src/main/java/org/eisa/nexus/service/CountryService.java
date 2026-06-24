package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;

import org.eisa.nexus.dto.PageResponse;
import org.eisa.nexus.entity.Country;
import org.eisa.nexus.repository.CountryRepository;
import org.eisa.nexus.entity.Region;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CountryService {

    private final CountryRepository repository;

    public PageResponse<Country> findAll(Region region, Pageable pageable) {
        Page<Country> page = region != null
                ? repository.findByRegion(region, pageable)
                : repository.findAll(pageable);
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public List<Country> findByAllCountry() {
        return repository.findAll();
    }

    public Country findByCode(String code) {
        return repository.findById(code)
                .orElseThrow(() -> new RuntimeException("Pays introuvable"));
    }

    public Country create(Country country) {
        if (repository.existsById(country.getCode())) {
            throw new RuntimeException("Ce pays existe déjà");
        }
        if (country.getSourceLang() == null) country.setSourceLang("fr");
        return repository.save(country);
    }

    public Country update(String code, Country updated) {
        Country country = findByCode(code);
        country.setCode(updated.getCode());
        country.setRegion(updated.getRegion());
        if (updated.getSourceLang() != null) country.setSourceLang(updated.getSourceLang());
        if (updated.getTranslations() != null) country.setTranslations(updated.getTranslations());
        return repository.save(country);
    }

    @Transactional
    public Country addTranslation(String code, String lang, String name) {
        Country country = findByCode(code);
        country.getTranslations().put(lang, name);
        return repository.save(country);
    }

    public long countAll() {
        return repository.count();
    }

    public void delete(String code) {
        repository.deleteById(code);
    }
}
