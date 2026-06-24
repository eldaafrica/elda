package org.eisa.nexus.repository;

import org.eisa.nexus.entity.Institution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionRepository extends JpaRepository<Institution, String> {

    Page<Institution> findByCountry(String country, Pageable pageable);

    Page<Institution> findByCategory(Institution.Category category, Pageable pageable);

    Page<Institution> findByCountryAndCategory(String country, Institution.Category category, Pageable pageable);
}
