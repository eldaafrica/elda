package org.eisa.nexus.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eisa.nexus.entity.Language;
import org.eisa.nexus.service.LanguageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class LanguageBootstrap implements CommandLineRunner {

    private final LanguageService service;

    @Override
    public void run(String... args) {
        seed("fr", "French", "Français");
        seed("en", "English", "Anglais");
    }

    private void seed(String code, String nameEn, String nameFr) {
        service.saveIfAbsent(Language.builder()
                .code(code)
                .nameEn(nameEn)
                .nameFr(nameFr)
                .active(true)
                .build());
    }
}
