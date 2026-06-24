package org.eisa.nexus.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "missions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mission {

    public enum Type {
        OBSERVATION,
        ASSISTANCE,
        REVUE_TECHNIQUE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Type type;

    /** ISO country code. */
    @Column(length = 10)
    private String country;

    private String cycle;
    private LocalDate startDate;
    private LocalDate endDate;
    private String leadObserver;

    /** Soft FK to institutions.id. */
    private String institutionId;

    /** Language the record was originally created in ("fr", "en", …). */
    @Column(length = 10)
    @Builder.Default
    private String sourceLang = "fr";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "mission_translations",
        joinColumns = @JoinColumn(name = "mission_id")
    )
    @MapKeyColumn(name = "lang")
    @Fetch(FetchMode.SELECT)
    @BatchSize(size = 25)
    @Builder.Default
    private Map<String, MissionTranslation> translations = new HashMap<>();
}
