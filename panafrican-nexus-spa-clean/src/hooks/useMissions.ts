import { useCallback, useEffect, useState } from "react";

import { missionService } from "@/services/missionService";

import type {
  Mission,
  MissionCreateRequest,
  MissionType,
  MissionUpdateRequest,
  Page,
  PageRequest,
  ReponsePage,
} from "@/types";

export function useMissions(params?: {
  page?: number;
  size?: number;

  institutionId?: string;

  country?: string;

  type?: MissionType;

  search?: string;
}) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsAll, setMissionsAll] = useState<Mission[]>([]);

  const [pageInfo, setPageInfo] = useState<ReponsePage<Mission> | null>(null);

  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await missionService.list({
        page: params?.page,
        size: params?.size,
        institutionId: params?.institutionId,
        country: params?.country,
        type: params?.type,
        search: params?.search,
      });

      setMissions(data.content);
      setPageInfo(data);
    } finally {
      setLoading(false);
    }
  }, [
    params?.page,
    params?.size,
    params?.institutionId,
    params?.country,
    params?.type,
    params?.search,
  ]);

  useEffect(() => {
    load();
  }, [
    params?.page,
    params?.size,
    params?.institutionId,
    params?.country,
    params?.type,
    params?.search,
  ]);

  const loadAllMissions = useCallback(async (): Promise<Mission[]> => {
        try {
          setLoading(true);
    
          const data = await missionService.findAllMissions();
    
          console.log("ALL MISSIONS =>", data);
    
          const missions = data ?? [];
    
          setMissionsAll(missions);
    
          return missions;
        } catch (error) {
          console.error("Erreur lors du chargement des missions :", error);
    
          setMissionsAll([]);
          return [];
        } finally {
          setLoading(false);
        }
      }, []);
  

  // ================= CRUD =================

  const create = async (payload: MissionCreateRequest) => {
    await missionService.create(payload);

    await load();
  };

  const update = async (id: string, payload: MissionCreateRequest) => {
    await missionService.update(id, payload);

    await load();
  };

  const remove = async (id: string) => {
    await missionService.remove(id);

    await load();
  };

  return {
    missions,
    pageInfo,
    loading,
    missionsAll,

    reload: load,
    loadAllMissions,
    create,
    update,
    remove,
  };
}
// export function useMissions(params?: {
//   page?: number;
//   size?: number;
//   country?: string;
//   type?: MissionType;
//   search?: string;
//   institutionId?: string;
// }) {
//   const [missions, setMissions] = useState<Mission[]>([]);
//   const [pageInfo, setPageInfo] = useState<ReponsePage<Mission> | null>(null);
//   const [loading, setLoading] = useState(true);

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);

//       const data = await missionService.list(params);

//       setMissions(data.content);
//       setPageInfo(data);
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     params?.page,
//     params?.size,
//     params?.institutionId,
//     params?.country,
//     params?.type,
//     params?.search,
//   ]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const create = async (payload: Partial<Mission>) => {
//     await missionService.create(payload);
//     await load();
//   };

//   const update = async (id: string, payload: Partial<Mission>) => {
//     await missionService.update(id, payload);
//     await load();
//   };

//   const remove = async (id: string) => {
//     await missionService.remove(id);
//     await load();
//   };

//   return {
//     missions,
//     pageInfo,
//     loading,
//     reload: load,
//     create,
//     update,
//     remove,
//   };
// }
