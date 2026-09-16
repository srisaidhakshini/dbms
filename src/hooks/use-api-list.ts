"use client";

import { useCallback, useEffect, useState } from "react";

export function useApiList<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = (await res.json()) as T[];
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch's setState calls run after an await, not synchronously during this effect
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, setData };
}
