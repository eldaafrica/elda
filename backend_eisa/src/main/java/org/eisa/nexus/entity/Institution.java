package org.eisa.nexus.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "institutions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Institution {

    public enum Category {
        COMMISSION_ELECTORALE,
        PARLEMENT,
        POUVOIR_JUDICIAIRE,
        GOUVERNEMENT,
        SOCIETE_CIVILE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /** Kept for backward compatibility; derived from translations[sourceLang] on save. */
    @Column
    private String name;

    @Column(length = 10)
    @Builder.Default
    private String sourceLang = "fr";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "institution_translations", joinColumns = @JoinColumn(name = "institution_id"))
    @MapKeyColumn(name = "lang")
    @Column(name = "name_translated", nullable = false)
    @Fetch(FetchMode.SELECT)
    @BatchSize(size = 25)
    @Builder.Default
    private Map<String, String> translations = new HashMap<>();

    /** Country code — soft reference (no FK constraint for flexibility). */
    @Column(length = 10)
    private String country;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
