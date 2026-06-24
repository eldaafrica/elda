export interface Language {
  code: string;
  nameEn: string;
  nameFr: string;
  active: boolean;
}

export interface LanguageCreateRequest {
  code: string;
  nameEn: string;
  nameFr: string;
}
