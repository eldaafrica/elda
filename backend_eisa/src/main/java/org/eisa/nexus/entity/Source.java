package org.eisa.nexus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Source {

    private String label;

    @Column(length = 1000)
    private String url;

    private String pageRef;
}
