import { http } from "./http";

export type SiteParams = Record<string, Record<string, string>>;

export const siteParamService = {
  /** Public — no auth */
  getAll(): Promise<SiteParams> {
    return http.get<SiteParams>("/public/site-params").then((r) => r.data);
  },

  /** Admin — save translations for a key */
  upsert(key: string, translations: Record<string, string>): Promise<void> {
    return http.put(`/site-params/${encodeURIComponent(key)}`, translations).then(() => undefined);
  },

  delete(key: string): Promise<void> {
    return http.delete(`/site-params/${encodeURIComponent(key)}`).then(() => undefined);
  },
};
