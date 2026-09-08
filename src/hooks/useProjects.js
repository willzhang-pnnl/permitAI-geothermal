import { useCallback, useEffect, useState } from "react";
import { fetchProjects } from "../api/geothermalApi";

export function useProjects({ search, state }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProjects({
          search,
          state,
          signal,
        });

        setProjects(data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load projects");
        }
      } finally {
        setLoading(false);
      }
    },
    [search, state]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadProjects(controller.signal);

    return () => controller.abort();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    reload: () => loadProjects(),
  };
}