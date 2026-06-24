package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.Language;
import org.eisa.nexus.exception.ConflictException;
import org.eisa.nexus.exception.NotFoundException;
import org.eisa.nexus.repository.LanguageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageService {

    private final LanguageRepository repo;

    public List<Language> findAll() {
        return repo.findByActiveTrueOrderByCode();
    }

    public Language findById(String code) {
        return repo.findById(code).orElseThrow(() -> new NotFoundException("Language " + code));
    }

    public Language create(Language lang) {
        if (repo.existsById(lang.getCode())) {
            throw new ConflictException("Language already exists: " + lang.getCode());
        }
        lang.setActive(true);
        return repo.save(lang);
    }

    public void delete(String code) {
        Language lang = findById(code);
        lang.setActive(false);
        repo.save(lang);
    }

    public boolean existsById(String code) {
        return repo.existsById(code);
    }

    public void saveIfAbsent(Language lang) {
        if (!repo.existsById(lang.getCode())) {
            repo.save(lang);
        }
    }
}
