package org.eisa.nexus.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "site_params")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SiteParam {

    /** Clé unique, ex: "about.title", "about.lede", "about.principles.1" */
    @Id
    @Column(length = 100)
    private String paramKey;

    /** Traductions par code langue : { "fr": "...", "en": "..." } */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "site_param_translations",
        joinColumns = @JoinColumn(name = "param_key")
    )
    @MapKeyColumn(name = "lang", length = 10)
    @Column(name = "value", columnDefinition = "TEXT")
    private Map<String, String> translations = new HashMap<>();
}
