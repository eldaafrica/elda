export type Category =
  | "COMMISSION_ELECTORALE"
  | "PARLEMENT"
  | "POUVOIR_JUDICIAIRE"
  | "GOUVERNEMENT"
  | "SOCIETE_CIVILE";

export interface Institution {
  id: string;
  name?: string;
  sourceLang: string;
  translations: Record<string, string>;
  country: string;
  category: Category;
  createdAt: string;
}

export interface InstitutionCreateRequest {
  sourceLang: string;
  translations: Record<string, string>;
  country: string;
  category: Category;
}

export type InstitutionUpdateRequest = Partial<InstitutionCreateRequest>;
