package org.eisa.nexus.controller;

import lombok.RequiredArgsConstructor;

import org.eisa.nexus.entity.Mission;
import org.eisa.nexus.entity.MissionTranslation;
import org.eisa.nexus.service.MissionService;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService service;

    @GetMapping
    public Page<Mission> all(

            @RequestParam(required = false) String institutionId,

            @RequestParam(required = false) String country,

            @RequestParam(required = false) Mission.Type type,

            @RequestParam(required = false) String search,

            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.findAllFiltered(
                institutionId,
                country,
                type,
                search,
                pageable);
    }

    @GetMapping("/all")
    public List<Mission> getAll() {
        return service.findByAllMissions();
    }

    @GetMapping("/{id}")
    public Mission one(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Mission create(@RequestBody Mission m) {
        return service.create(m);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Mission update(@PathVariable String id, @RequestBody Mission m) {
        return service.update(id, m);
    }

    @PutMapping("/{id}/translations/{lang}")
    @PreAuthorize("hasAnyRole('ADMIN','EDITEUR')")
    public Mission addTranslation(
            @PathVariable String id,
            @PathVariable String lang,
            @RequestBody MissionTranslation t) {
        return service.addTranslation(id, lang, t);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
