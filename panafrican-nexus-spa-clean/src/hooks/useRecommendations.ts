import { useCallback, useEffect, useState } from "react";

import { recommendationService } from "@/services/recommendationService";

import type {
  Recommendation,
  RecommendationCreateRequest,
  RecommendationFilters,
  RecommendationUpdateRequest,
  Page,
  ReponsePage,
} from "@/types";


export function useRecommendations(
  initialFilters: RecommendationFilters = {}
) {
  // ===================== STATE =====================

  const [data, setData] =
    useState<ReponsePage<Recommendation> | null>(null);

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] =
    useState<RecommendationFilters>({
      page: 0,
      size: 10,
      sort: "issuedDate,desc",
      ...initialFilters,
    });

  // ===================== LOAD =====================

  const load = useCallback(
    async (currentFilters: RecommendationFilters) => {
      try {
        setLoading(true);

        const hasAdvancedFilters =
          currentFilters.q ||
          currentFilters.missionId ||
          currentFilters.institutionId ||
          currentFilters.theme ||
          currentFilters.statut ||
          currentFilters.priorite ||
          currentFilters.visibilite;

        const res = hasAdvancedFilters
          ? await recommendationService.search(
              currentFilters
            )
          : await recommendationService.listAll(
              currentFilters
            );

        setData(res);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ===================== EFFECT =====================

  useEffect(() => {
    load(filters);
  }, [
    filters.q,
    filters.missionId,
    filters.institutionId,
    filters.theme,
    filters.statut,
    filters.priorite,
    filters.visibilite,
    filters.page,
    filters.size,
    filters.sort,
    load,
  ]);

  // ===================== FILTER UPDATE =====================

  const updateFilters = (
    newFilters: Partial<RecommendationFilters>
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 0,
    }));
  };

  // ===================== PAGINATION =====================

  const setPage = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const setSize = (size: number) => {
    setFilters((prev) => ({
      ...prev,
      size,
      page: 0,
    }));
  };

  // ===================== CRUD =====================

  const create = async (
    payload: RecommendationCreateRequest
  ) => {
    await recommendationService.create(payload);

    await load(filters);
  };

  const update = async (
    id: string,
    payload: RecommendationUpdateRequest
  ) => {
    await recommendationService.update(id, payload);

    await load(filters);
  };

  const remove = async (id: string) => {
    await recommendationService.delete(id);

    await load(filters);
  };

  // ===================== VISIBILITY =====================

  const publish = async (id: string) => {
    await recommendationService.publish(id);

    await load(filters);
  };

  const unpublish = async (id: string) => {
    await recommendationService.unpublish(id);

    await load(filters);
  };

  const draft = async (id: string) => {
    await recommendationService.draft(id);

    await load(filters);
  };

  // ===================== RETURN =====================

  return {
    recommendations: data?.content ?? [],
    pageInfo: data,

    loading,

    filters,
    setFilters,
    updateFilters,

    setPage,
    setSize,

    reload: () => load(filters),

    create,
    update,
    remove,

    publish,
    unpublish,
    draft,
  };
}

// export function useRecommendations(initialFilters: RecommendationFilters = {}) {
//   // ===================== STATE =====================

//   const [data, setData] = useState<ReponsePage<Recommendation> | null>(null);
//   const [loading, setLoading] = useState(false);

//   const [filters, setFilters] = useState<RecommendationFilters>({
//     page: 0,
//     size: 10,
//     sort: "issuedDate,desc",
//     ...initialFilters,
//   });

//   // ===================== LOAD (SEARCH OU ALL) =====================

//   const load = useCallback(async () => {
//     try {
//       setLoading(true);

    
//       const hasAdvancedFilters =
//         filters.q ||
//         filters.missionId ||
//         filters.institutionId ||
//         filters.theme ||
//         filters.statut ||
//         filters.priorite ||
//         filters.visibilite;

//       const res = hasAdvancedFilters
//         ? await recommendationService.search(filters)
//         : await recommendationService.listAll(filters);

//       setData(res);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   // ===================== EFFECT =====================

//   useEffect(() => {
//     load();
//   }, [load]);

//   // ===================== FILTER UPDATE =====================

//   const updateFilters = (newFilters: Partial<RecommendationFilters>) => {
//     setFilters((prev) => ({
//       ...prev,
//       ...newFilters,
//       page: 0,
//     }));
//   };

//   const setPage = (page: number) => {
//     setFilters((prev) => ({ ...prev, page }));
//   };

//   const setSize = (size: number) => {
//     setFilters((prev) => ({ ...prev, size, page: 0 }));
//   };

//   // ===================== CRUD ACTIONS =====================

//   const create = async (payload: RecommendationCreateRequest) => {
//     await recommendationService.create(payload);
//     await load();
//   };

//   const update = async (id: string, payload: RecommendationUpdateRequest) => {
//     await recommendationService.update(id, payload);
//     await load();
//   };

//   const remove = async (id: string) => {
//     await recommendationService.delete(id);
//     await load();
//   };

//   // ===================== VISIBILITY ACTIONS =====================

//   const publish = async (id: string) => {
//     await recommendationService.publish(id);
//     await load();
//   };

//   const unpublish = async (id: string) => {
//     await recommendationService.unpublish(id);
//     await load();
//   };

//   const draft = async (id: string) => {
//     await recommendationService.draft(id);
//     await load();
//   };

//   // ===================== RETURN =====================

//   return {
//     // data
//     recommendations: data?.content ?? [],
//     pageInfo: data,
//     // state
//     loading,

//     // filters
//     filters,
//     setFilters,
//     updateFilters,

//     // pagination
//     setPage,
//     setSize,

//     // actions
//     reload: load,
//     create,
//     update,
//     remove,
//     publish,
//     unpublish,
//     draft,
//   };
// }