import { http } from "./http";
import type { Page, ReponsePage } from "../types/common";
import type {
  Recommendation,
  RecommendationCreateRequest,
  RecommendationFilters,
  RecommendationUpdateRequest,
  Visibilite,
} from "../types/recommendation";

export const publicService = {
  listPublished(filters: RecommendationFilters): Promise<Page<Recommendation>> {
    return http
      .get<Page<Recommendation>>("/public/recommendations", {
        params: {
          q: filters.q,
          missionId: filters.missionId,
          institutionId: filters.institutionId,
          theme: filters.theme,
          statut: filters.statut,
          priorite: filters.priorite,
          page: filters.page,
          size: filters.size,
          sort: filters.sort,
        },
      })
      .then((r) => r.data);
  },

  getStats(): Promise<{
    totalRecommendations: number;
    implementedRecommendations: number;
    totalMissions: number;
    totalCountries: number;
  }> {
    return http.get("/public/stats").then((r) => r.data);
  },

  getMissions(params?: { country?: string; page?: number; size?: number }) {
    return http
      .get<ReponsePage<any>>("/public/missions", { params })
      .then((r) => r.data);
  },

  getCountries(): Promise<any[]> {
    return http.get("/public/countries").then((r) => r.data);
  },

  getById(id: string): Promise<any> {
    return http.get(`/public/recommendations/${id}`).then((r) => r.data);
  },

  getFollowUps(recoId: string): Promise<any[]> {
    return http.get(`/public/recommendations/${recoId}/followups`).then((r) => r.data);
  },

  getMissionById(id: string): Promise<any> {
    return http.get(`/public/missions/${id}`).then((r) => r.data);
  },

  getInstitutionById(id: string): Promise<any> {
    return http.get(`/public/institutions/${id}`).then((r) => r.data);
  },
};

const BASE = "/recommendations";

export const recommendationService = {
  list(params?: RecommendationFilters): Promise<ReponsePage<Recommendation>> {
    return http
      .get<ReponsePage<Recommendation>>(BASE, { params })
      .then((r) => r.data);
  },

  // ===================== SEARCH AVANCÉ =====================

  search(
  params: RecommendationFilters
): Promise<ReponsePage<Recommendation>> {
  return http
    .get<ReponsePage<Recommendation>>(BASE, {
      params: {
        q: params.q,

        missionId: params.missionId,
        institutionId: params.institutionId,
        codeCountry: params.codeCountry,

        theme: params.theme,
        statut: params.statut,

        priorite: params.priorite,
        visibilite: params.visibilite,

        page: params.page,
        size: params.size,
        sort: params.sort,
      },
    })
    .then((r) => r.data);
},

 
listAll(params: RecommendationFilters): Promise<ReponsePage<Recommendation>> {
  return http
    .get<ReponsePage<Recommendation>>(`${BASE}/all`, {
      params: {
        theme: params.theme,
        statut: params.statut,
        visibilite: params.visibilite, // ✅ AJOUT ICI
        q: params.q,
        page: params.page,
        size: params.size,
      },
    })
    .then((r) => r.data);
},

  async getRecent(): Promise<Recommendation[]> {
    const { data } = await http.get("recommendations/recents");
    return data;
  },

  // ===================== CRUD =====================

  getById(id: string): Promise<Recommendation> {
    return http.get(`${BASE}/${id}`).then((r) => r.data);
  },

  create(payload: RecommendationCreateRequest): Promise<Recommendation> {
    return http.post(BASE, payload).then((r) => r.data);
  },

  update(
    id: string,
    payload: RecommendationUpdateRequest
  ): Promise<Recommendation> {
    return http.put(`${BASE}/${id}`, payload).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined);
  },

  // ===================== VISIBILITÉ =====================

  publish(id: string): Promise<Recommendation> {
    return http.post(`${BASE}/${id}/publish`).then((r) => r.data);
  },

  unpublish(id: string): Promise<Recommendation> {
    return http.post(`${BASE}/${id}/unpublish`).then((r) => r.data);
  },

  draft(id: string): Promise<Recommendation> {
    return http.post(`${BASE}/${id}/draft`).then((r) => r.data);
  },

  setVisibility(id: string, visibility: Visibilite): Promise<Recommendation> {
    return http
      .patch(`${BASE}/${id}/visibility`, { visibility })
      .then((r) => r.data);
  },

  addTranslation(
    id: string,
    lang: string,
    payload: { title?: string; summary?: string; body?: string }
  ): Promise<Recommendation> {
    return http.put(`${BASE}/${id}/translations/${lang}`, payload).then((r) => r.data);
  },
};