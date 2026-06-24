package org.eisa.nexus.repository;

import org.eisa.nexus.entity.Mission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface MissionRepository
        extends JpaRepository<Mission, String>, JpaSpecificationExecutor<Mission> {

    Optional<Mission> findByCode(String code);

    List<Mission> findByCountry(String country);

    Page<Mission> findByInstitutionId(String institutionId, Pageable pageable);
}
