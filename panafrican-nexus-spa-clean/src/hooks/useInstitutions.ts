import { useCallback, useEffect, useState } from "react";

import { institutionService } from "@/services/institutionService";

import type {
  Category,
  Institution,
  InstitutionCreateRequest,
  InstitutionUpdateRequest,
  Page,
  PageRequest,
  ReponsePage,
} from "@/types";
export function useInstitutions(params?: {
  country?: string;
  category?: Institution["category"];
  page?: number;
  size?: number;
}) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsAll, setInstitutionsAll] = useState<Institution[]>([]);

  const [pageInfo, setPageInfo] =
    useState<ReponsePage<Institution> | null>(null);

  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await institutionService.list({
        country: params?.country,
        category: params?.category,
        page: params?.page,
        size: params?.size,
      });

      console.log("RAW SPRING PAGE =>", data);

      setInstitutions(data?.content ?? []);

      setPageInfo(data);
    } finally {
      setLoading(false);
    }
  }, [
    params?.country,
    params?.category,
    params?.page,
    params?.size,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const loadAllInstitutions = useCallback(async (): Promise<Institution[]> => {
      try {
        setLoading(true);
  
        const data = await institutionService.findAllInstitutions();
  
        console.log("ALL INSTITUTIONS =>", data);
  
        const institutions = data ?? [];
  
        setInstitutionsAll(institutions);
  
        return institutions;
      } catch (error) {
        console.error("Erreur lors du chargement des institutions :", error);
  
        setInstitutionsAll([]);
        return [];
      } finally {
        setLoading(false);
      }
    }, []);

  const create = async (payload: InstitutionCreateRequest) => {
    await institutionService.create(payload);
    await load();
  };

  const update = async (
    id: string,
    payload: InstitutionUpdateRequest
  ) => {
    await institutionService.update(id, payload);
    await load();
  };

  const remove = async (id: string) => {
    await institutionService.remove(id);
    await load();
  };

  return {
    institutions,
    pageInfo,
    loading,
    institutionsAll,

    reload: load,
    loadAllInstitutions,

    create,
    update,
    remove,
  };
}


// export function useInstitutions(initialParams?: PageRequest) {
//   const [data, setData] = useState<Page<Institution> | null>(null);

//   const [loading, setLoading] = useState(false);

//   const [params, setParams] = useState<PageRequest>({
//     page: 0,
//     size: 10,
//     sort: "name,asc",
//     ...initialParams,
//   });

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);

//       const res = await institutionService.list(params);

//       setData(res);
//     } finally {
//       setLoading(false);
//     }
//   }, [params]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const create = async (payload: InstitutionCreateRequest) => {
//     await institutionService.create(payload);

//     await load();
//   };

//   const update = async (
//     id: string,
//     payload: InstitutionUpdateRequest,
//   ) => {
//     await institutionService.update(id, payload);

//     await load();
//   };

//   const remove = async (id: string) => {
//     await institutionService.remove(id);

//     await load();
//   };

//   return {
//     institutions: data?.content ?? [],

//     page: data,

//     loading,

//     params,
//     setParams,

//     reload: load,

//     create,
//     update,
//     remove,
//   };
// }