import { http } from "./http";
import type { Page, PageRequest, ReponsePage } from "../types/common";
import type {
  Mission,
  MissionCreateRequest,
  MissionType,
  MissionUpdateRequest,
} from "../types/mission";

const BASE = "/missions";

export const missionService = {
  list(params?: {
    page?: number;
    size?: number;
    institutionId?: string;
    country?: string;
    type?: MissionType;
    search?: string;
  }) {
    return http.get<ReponsePage<Mission>>(BASE, { params }).then((r) => r.data);
  },
  
  async findAllMissions(): Promise<Mission[]> {
    const { data } = await http.get<Mission[]>("/missions/all");
    return data;
  },

  getById(id: string): Promise<Mission> {
    return http.get(`${BASE}/${id}`).then((r) => r.data);
  },

  findById(id: string): Promise<Mission> {
    return http.get(`${BASE}/${id}`).then((r) => r.data);
  },

  create(payload: Partial<Mission>): Promise<Mission> {
    return http.post(BASE, payload).then((r) => r.data);
  },

  update(id: string, payload: Partial<Mission>): Promise<Mission> {
    return http.put(`${BASE}/${id}`, payload).then((r) => r.data);
  },

  addTranslation(id: string, lang: string, payload: { summary?: string }): Promise<Mission> {
    return http.put(`${BASE}/${id}/translations/${lang}`, payload).then((r) => r.data);
  },

  remove(id: string): Promise<void> {
    return http.delete(`${BASE}/${id}`).then(() => undefined);
  },
};
