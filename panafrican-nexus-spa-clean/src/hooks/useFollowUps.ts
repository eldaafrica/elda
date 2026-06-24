import { useCallback, useEffect, useState } from "react";
import { followUpService, type FollowUp, type FollowUpCreateRequest } from "@/services/followUpService";

export function useFollowUps(recommendationId?: string) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = recommendationId
        ? await followUpService.findByRecommendation(recommendationId)
        : await followUpService.findAll();
      setFollowUps(data);
    } catch (e: any) {
      setError(e?.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [recommendationId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (payload: FollowUpCreateRequest) => {
    await followUpService.create(payload);
    await load();
  };

  const update = async (id: string, payload: Partial<FollowUpCreateRequest>) => {
    await followUpService.update(id, payload);
    await load();
  };

  const remove = async (id: string) => {
    await followUpService.remove(id);
    await load();
  };

  return { followUps, loading, error, create, update, remove, reload: load };
}
