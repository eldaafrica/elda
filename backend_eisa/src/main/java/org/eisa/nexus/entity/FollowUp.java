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
@Table(name = "follow_ups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /** Soft FK to recommendations.id. */
    @Column(nullable = false)
    private String recommendationId;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Statut statut;

    @Column(length = 10)
    @Builder.Default
    private String sourceLang = "fr";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "follow_up_translations", joinColumns = @JoinColumn(name = "follow_up_id"))
    @MapKeyColumn(name = "lang")
    @Column(name = "note", columnDefinition = "TEXT")
    @Fetch(FetchMode.SELECT)
    @BatchSize(size = 25)
    @Builder.Default
    private Map<String, String> translations = new HashMap<>();

    private String author;
}
