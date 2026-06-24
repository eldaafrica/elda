package org.eisa.nexus.repository;

import org.eisa.nexus.entity.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, String> {
    List<FollowUp> findByRecommendationIdOrderByDateDesc(String recommendationId);
    List<FollowUp> findAllByOrderByDateDesc();
}
