export type MissionType =
  | "OBSERVATION"
  | "ASSISTANCE"
  | "REVUE_TECHNIQUE";

export interface MissionTranslation {
  summary?: string;
}

export interface Mission {
  id: string;
  code: string;
  type: MissionType;
  country: string;
  cycle: string;
  startDate?: string;
  endDate?: string;
  leadObserver?: string;
  institutionId?: string;
  sourceLang: string;
  translations: Record<string, MissionTranslation>;
}

export interface MissionCreateRequest {
  code: string;
  type: MissionType;
  country: string;
  cycle: string;
  startDate?: string;
  endDate?: string;
  leadObserver?: string;
  institutionId?: string;
  sourceLang: string;
  translations: Record<string, MissionTranslation>;
}

export type MissionUpdateRequest = Partial<MissionCreateRequest>;
