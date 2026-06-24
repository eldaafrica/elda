import { http } from "./http";
import type { Page, PageRequest, ReponsePage } from "../types/common";
import type {
  Institution,
  InstitutionCreateRequest,
  InstitutionUpdateRequest,
} from "../types/institution";

const BASE = "/institutions";

export const institutionService = {
  list(params?: {
    country?: string;
    category?: Institution["category"];
    page?: number;
    size?: number;
  }): Promise<ReponsePage<Institution>> {
    return http
      .get<ReponsePage<Institution>>("/institutions", {
        params: {
          country: params?.country || undefined,
          category: params?.category || undefined,
          page: params?.page ?? 0,
          size: params?.size ?? 20,
        },
      })
      .then((r) => r.data);
  },

  async findAllInstitutions(): Promise<Institution[]> {
  const { data } = await http.get<Institution[]>("/institutions/all");
  return data;
},

  getById(id: string): Promise<Institution> {
    return http.get(`/institutions/${id}`).then((r) => r.data);
  },

  create(payload: InstitutionCreateRequest): Promise<Institution> {
    return http.post("/institutions", payload).then((r) => r.data);
  },

  update(id: string, payload: InstitutionUpdateRequest): Promise<Institution> {
    return http.put(`/institutions/${id}`, payload).then((r) => r.data);
  },

  addTranslation(id: string, lang: string, name: string): Promise<Institution> {
    return http.put(`/institutions/${id}/translations/${lang}`, { name }).then((r) => r.data);
  },

  remove(id: string): Promise<void> {
    return http.delete(`/institutions/${id}`).then(() => undefined);
  },
};
