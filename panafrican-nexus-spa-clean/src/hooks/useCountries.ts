import { useCallback, useEffect, useState } from "react";
import { countryService } from "@/services/countryService";
import type { Country, CountryCreateRequest, CountryUpdateRequest, Region } from "@/types/country";
import { Page } from "@/types/common";

export function useCountries(params?: {
  region?: Region;
  page?: number;
  size?: number;
}) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesAll, setCountriesAll] = useState<Country[]>([]);
  const [pageInfo, setPageInfo] = useState<Page<Country> | null>(null);
  const [loading, setLoading] = useState(false);

  // ================= PAGINATED =================
  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await countryService.findAll({
        region: params?.region,
        page: params?.page,
        size: params?.size,
      });

      console.log("RAW API DATA =>", data);

      setCountries(data?.data ?? []);
      setPageInfo(data ?? null);
    } catch (error) {
      console.error("Error loading countries:", error);
      setCountries([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
    }
  }, [params?.region, params?.page, params?.size]);

  useEffect(() => {
    load();
  }, [load]);

  // ================= ALL COUNTRIES =================
  const loadAllCountries = useCallback(async (): Promise<Country[]> => {
    try {
      setLoading(true);

      const data = await countryService.findAllCountry();

      console.log("ALL COUNTRIES =>", data);

      const countries = data ?? [];

      setCountriesAll(countries);

      return countries;
    } catch (error) {
      console.error("Erreur lors du chargement des pays :", error);

      setCountriesAll([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= CRUD =================
  const create = async (payload: CountryCreateRequest) => {
    await countryService.create(payload);
    await load();
  };

  const update = async (code: string, payload: CountryUpdateRequest) => {
    await countryService.update(code, payload);
    await load();
  };

  const remove = async (code: string) => {
    await countryService.delete(code);
    await load();
  };

  return {
    countries,
    countriesAll,
    pageInfo,
    loading,

    reload: load,
    loadAllCountries,

    create,
    update,
    remove,
  };
}
// export function useCountries(params?: {
//   region?: Region;
//   page?: number;
//   size?: number;
// }) {
//   const [countries, setCountries] = useState<Country[]>([]);
//   const [pageInfo, setPageInfo] = useState<Page<Country> | null>(null);
//   const [loading, setLoading] = useState(true);

//   const load = useCallback(async () => {
//   try {
//     setLoading(true);

//     const data = await countryService.findAll({
//       region: params?.region,
//       page: params?.page,
//       size: params?.size,
//     });

//     console.log("RAW API DATA =>", data);

//     // ✅ IMPORTANT FIX
//     setCountries(data.data ?? []);
//     setPageInfo(data);

//   } finally {
//     setLoading(false);
//   }
// }, [params?.region, params?.page, params?.size]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const AllCountry = async () => {
//    const data =  await countryService.findAllCountry();
//    setCountries(data);
//     console.log("ALL COUNTRY =>", data);
//   };

//   const create = async (payload: CountryCreateRequest) => {
//     await countryService.create(payload);
//     await load();
//   };

//   const update = async (code: string, payload: CountryUpdateRequest) => {
//     await countryService.update(code, payload);
//     await load();
//   };

//   const remove = async (code: string) => {
//     await countryService.delete(code);
//     await load();
//   };

//   return {
//     countries,
//     pageInfo,
//     loading,
//     reload: load,
//     create,
//     update,
//     remove,
//     AllCountry
//   };
// }
