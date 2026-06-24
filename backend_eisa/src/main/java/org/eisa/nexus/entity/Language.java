package org.eisa.nexus.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "languages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Language {

    /** ISO 639-1 code, e.g. "fr", "en", "ar", "pt". */
    @Id
    @Column(length = 10)
    private String code;

    private String nameEn;
    private String nameFr;

    @Builder.Default
    private boolean active = true;
}
