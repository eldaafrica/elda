import { http } from "./http";
import type { Statut } from "@/types";

export interface FollowUp {
  id: string;
  recommendationId: string;
  date: string;
  statut: Statut;
  sourceLang: string;
  translations: Record<string, string>;
  author?: string;
}

export interface FollowUpCreateRequest {
  recommendationId: string;
  date: string;
  statut: Statut;
  sourceLang: string;
  translations: Record<string, string>;
  author?: string;
}

const BASE = "/follow-ups";

export const followUpService = {
  findAll(): Promise<FollowUp[]> {
    return http.get<FollowUp[]>(BASE).then((r) => r.data);
  },

  findByRecommendation(recommendationId: string): Promise<FollowUp[]> {
    return http.get<FollowUp[]>(BASE, { params: { recommendationId } }).then((r) => r.data);
  },

  getById(id: string): Promise<FollowUp> {
    return http.get<FollowUp>(`${BASE}/${id}`).then((r) => r.data);
  },

  create(payload: FollowUpCreateRequest): Promise<FollowUp> {
    return http.post<FollowUp>(BASE, payload).then((r) => r.data);
  },

  update(id: string, payload: Partial<FollowUpCreateRequest>): Promise<FollowUp> {
    return http.put<FollowUp>(`${BASE}/${id}`, payload).then((r) => r.data);
  },

  addTranslation(id: string, lang: string, note: string): Promise<FollowUp> {
    return http.put<FollowUp>(`${BASE}/${id}/translations/${lang}`, { note }).then((r) => r.data);
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined);
  },
};
