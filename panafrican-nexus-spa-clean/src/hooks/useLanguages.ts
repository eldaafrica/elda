import { useCallback, useEffect, useState } from "react";
import type { Language, LanguageCreateRequest } from "@/types/language";
import { languageService } from "@/services/languageService";

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await languageService.findAll();
      setLanguages(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (payload: LanguageCreateRequest) => {
    const lang = await languageService.create(payload);
    setLanguages((prev) => [...prev, lang]);
    return lang;
  }, []);

  const remove = useCallback(async (code: string) => {
    await languageService.remove(code);
    setLanguages((prev) => prev.filter((l) => l.code !== code));
  }, []);

  return { languages, loading, create, remove, reload: load };
}
