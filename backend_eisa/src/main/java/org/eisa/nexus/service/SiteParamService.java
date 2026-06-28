package org.eisa.nexus.service;

import lombok.RequiredArgsConstructor;
import org.eisa.nexus.entity.SiteParam;
import org.eisa.nexus.repository.SiteParamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SiteParamService {

    private final SiteParamRepository repo;

    @Transactional(readOnly = true)
    public List<SiteParam> findAll() {
        return repo.findAll();
    }

    /**
     * Sauvegarde (ou crée) une traduction pour une clé.
     * lang=null → remplace toutes les traductions par le map fourni.
     */
    @Transactional
    public SiteParam upsert(String key, String lang, String value) {
        SiteParam param = repo.findById(key).orElseGet(() -> {
            SiteParam p = new SiteParam();
            p.setParamKey(key);
            return p;
        });
        param.getTranslations().put(lang, value);
        return repo.save(param);
    }

    @Transactional
    public SiteParam upsertAll(String key, Map<String, String> translations) {
        SiteParam param = repo.findById(key).orElseGet(() -> {
            SiteParam p = new SiteParam();
            p.setParamKey(key);
            return p;
        });
        param.getTranslations().putAll(translations);
        return repo.save(param);
    }

    @Transactional
    public void delete(String key) {
        repo.deleteById(key);
    }
}
