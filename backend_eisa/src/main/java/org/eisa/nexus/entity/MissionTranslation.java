package org.eisa.nexus.entity;

import jakarta.persistence.*;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MissionTranslation {

    @Column(columnDefinition = "TEXT")
    private String summary;
}
