package org.eisa.nexus.repository;

import org.eisa.nexus.entity.Country;
import org.eisa.nexus.entity.Region;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CountryRepository extends JpaRepository<Country, String> {

    Page<Country> findByRegion(Region region, Pageable pageable);
}
