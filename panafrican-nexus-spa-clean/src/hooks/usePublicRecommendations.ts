import { useCallback, useEffect, useState } from "react";
import { publicService } from "@/services/recommendationService";
import type { Recommendation, RecommendationFilters } from "@/types";
import type { ReponsePage } from "@/types/common";

export function usePublicRecommendations(filters?: RecommendationFilters) {
  const [data, setData] = useState<ReponsePage<Recommendation> | null>(null);
  const [loading, setLoading] = useState(false);

  const q = filters?.q;
  const theme = filters?.theme;
  const statut = filters?.statut;
  const priorite = filters?.priorite;
  const missionId = filters?.missionId;
  const institutionId = filters?.institutionId;
  const page = filters?.page ?? 0;
  const size = filters?.size ?? 15;
  const sort = filters?.sort ?? "lastUpdate,desc";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await publicService.listPublished({
        q,
        theme,
        statut,
        priorite,
        missionId,
        institutionId,
        page,
        size,
        sort,
      });
      // publicService retourne Page<T> (Spring format: content[])
      setData(res as unknown as ReponsePage<Recommendation>);
    } finally {
      setLoading(false);
    }
  }, [q, theme, statut, priorite, missionId, institutionId, page, size, sort]);

  useEffect(() => {
    load();
  }, [load]);

  // Supporte les deux formats de réponse backend (Spring Page = content[], custom = data[])
  const recommendations: Recommendation[] =
    (data as any)?.content ?? (data as any)?.data ?? [];

  return {
    recommendations,
    page: data,
    loading,
    reload: load,
  };
}
