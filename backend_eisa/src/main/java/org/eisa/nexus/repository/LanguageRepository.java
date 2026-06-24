package org.eisa.nexus.repository;

import org.eisa.nexus.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LanguageRepository extends JpaRepository<Language, String> {
    List<Language> findByActiveTrueOrderByCode();
}
