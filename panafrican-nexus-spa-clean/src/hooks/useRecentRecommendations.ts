import { recommendationService } from "@/services";
import { Recommendation } from "@/types";
import { useEffect, useState } from "react";


export function useRecentRecommendations() {
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecent = async () => {
    let alive = true;

    try {
      setLoading(true);
      setError(null);

      const res = await recommendationService.getRecent();

      if (alive) {
        setData(res);
      }
    } catch (e: any) {
      if (alive) {
        setError(e?.message || "Error loading recent recommendations");
      }
    } finally {
      if (alive) {
        setLoading(false);
      }
    }

    return () => {
      alive = false;
    };
  };

  useEffect(() => {
    const cleanupPromise = fetchRecent();
    return () => {
      cleanupPromise?.then((fn) => fn?.());
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchRecent,
  };
}