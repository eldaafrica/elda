import { http } from "./http";
import type { Language, LanguageCreateRequest } from "@/types/language";

const BASE = "/languages";

export const languageService = {
  findAll(): Promise<Language[]> {
    return http.get<Language[]>(BASE).then((r) => r.data);
  },

  create(payload: LanguageCreateRequest): Promise<Language> {
    return http.post<Language>(BASE, payload).then((r) => r.data);
  },

  remove(code: string): Promise<void> {
    return http.delete(`${BASE}/${code}`).then(() => undefined);
  },
};
