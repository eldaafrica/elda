import { http } from "@/services/http";
import { Page } from "@/types/common";
import type { Country, CountryCreateRequest, CountryUpdateRequest, Region } from "@/types/country";

export const countryService = {
  async findAll(params?: {
    region?: Region;
    page?: number;
    size?: number;
  }): Promise<Page<Country>> {
    const { data } = await http.get<Page<Country>>("/countries", {
      params: {
        region: params?.region,
        page: params?.page ?? 0,
        size: params?.size ?? 10,
      },
    });

    console.log("COUNTRY RESPONSE =>", data);

    return data;
  },

  async findAllCountry(): Promise<Country[]> {
    const { data } = await http.get<Country[]>("/countries/all");
    return data;
  },

  async findOne(code: string): Promise<Country> {
    const { data } = await http.get(`/countries/${code}`);
    return data;
  },

  async create(payload: CountryCreateRequest): Promise<Country> {
    const { data } = await http.post("/countries", payload);
    return data;
  },

  async update(code: string, payload: CountryUpdateRequest): Promise<Country> {
    const { data } = await http.put(`/countries/${code}`, payload);
    return data;
  },

  async addTranslation(code: string, lang: string, name: string): Promise<Country> {
    const { data } = await http.put(`/countries/${code}/translations/${lang}`, { name });
    return data;
  },

  async delete(code: string): Promise<void> {
    await http.delete(`/countries/${code}`);
  },
};
