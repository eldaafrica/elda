export type Region = "OUEST" | "EST" | "SUD" | "NORD" | "CENTRE";

export interface Country {
  code: string;
  region: Region;
  sourceLang: string;
  translations: Record<string, string>;
}

export interface CountryCreateRequest {
  code: string;
  region: Region;
  sourceLang: string;
  translations: Record<string, string>;
}

export type CountryUpdateRequest = Partial<CountryCreateRequest>;
