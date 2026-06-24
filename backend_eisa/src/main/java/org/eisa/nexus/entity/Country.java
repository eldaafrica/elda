package org.eisa.nexus.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "countries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Country {

    /** ISO 3166-1 alpha-2 code — natural PK (ex: "ML", "GH"). */
    @Id
    @Column(length = 10)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Region region;

    /** Language the record was originally created in ("fr", "en", …). */
    @Column(length = 10)
    @Builder.Default
    private String sourceLang = "fr";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "country_translations",
        joinColumns = @JoinColumn(name = "country_code")
    )
    @MapKeyColumn(name = "lang")
    @Column(name = "name", nullable = false)
    @Fetch(FetchMode.SELECT)
    @BatchSize(size = 25)
    @Builder.Default
    private Map<String, String> translations = new HashMap<>();
}
