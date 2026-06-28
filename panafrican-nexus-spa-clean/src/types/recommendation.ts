export type Statut =
  | "NOUVEAU"
  | "EN_COURS"
  | "PARTIEL"
  | "IMPLEMENTE"
  | "NON_IMPLEMENTE"
  | "INCONNU";

export type Priorite =
  | "HAUTE"
  | "MOYENNE"
  | "BASSE";

export type Visibilite =
  | "PUBLIC"
  | "INTERNE"
  | "BROUILLON";

export type Theme =
  | "JURIDIQUE"
  | "ADMINISTRATION"
  | "ELECTEURS"
  | "CAMPAGNE"
  | "MEDIAS"
  | "RESULTATS"
  | "INCLUSION"
  | "SECURITE"
  | "CIVISME";

export interface RecommendationTranslation {
  title?: string;
  summary?: string;
  body?: string;
}

export interface Recommendation {
  id: string;
  code: string;
  sourceLang: string;
  translations: Record<string, RecommendationTranslation>;
  codeCountry: string;
  missionId: string;
  institutionId: string;
  theme: Theme;
  statut: Statut;
  priorite: Priorite;
  visibilite?: Visibilite;
  issuedDate?: string;
  lastUpdate?: string;
  sources?: {
    label: string;
    url: string;
    pageRef?: string;
  }[];
}

export interface RecommendationCreateRequest {
  code: string;
  sourceLang: string;
  translations: Record<string, RecommendationTranslation>;
  missionId: string;
  institutionId: string;
  codeCountry: string;
  theme: Recommendation["theme"];
  priorite: Priorite;
  visibilite?: Visibilite;
}

export interface RecommendationFilters {
  q?: string;
  missionId?: string;
  institutionId?: string;
  codeCountry?: string;
  theme?: Recommendation["theme"];
  statut?: Statut;
  priorite?: Priorite;
  visibilite?: Visibilite;
  page?: number;
  size?: number;
  sort?: string;
}

export type RecommendationUpdateRequest =
  Partial<RecommendationCreateRequest> & {
    statut?: Statut;
  };
