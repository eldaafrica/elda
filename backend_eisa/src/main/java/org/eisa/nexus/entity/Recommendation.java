package org.eisa.nexus.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "recommendations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String code;

    /** Language the record was originally created in ("fr", "en", …). */
    @Column(length = 10)
    @Builder.Default
    private String sourceLang = "fr";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "recommendation_translations",
        joinColumns = @JoinColumn(name = "recommendation_id")
    )
    @MapKeyColumn(name = "lang")
    @Fetch(FetchMode.SELECT)
    @BatchSize(size = 25)
    @Builder.Default
    private Map<String, RecommendationTranslation> translations = new HashMap<>();

    /** ISO country code. */
    @Column(length = 10)
    private String codeCountry;

    /** Soft FK to missions.id. */
    private String missionId;

    /** Soft FK to institutions.id. */
    private String institutionId;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Theme theme;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Statut statut;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priorite priorite;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Visibilite visibilite;

    private LocalDate issuedDate;
    private LocalDate lastUpdate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "recommendation_sources",
        joinColumns = @JoinColumn(name = "recommendation_id")
    )
    @Fetch(FetchMode.SELECT)
    @BatchSize(size = 25)
    @Builder.Default
    private List<Source> sources = new ArrayList<>();
}
