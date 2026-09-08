import { useEffect, useState } from "react";
import { fetchProject } from "../api/geothermalApi";

export function useProject(projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProject(projectId, {
          signal: controller.signal,
        });

        setProject(data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load project");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProject();

    return () => controller.abort();
  }, [projectId]);

  return {
    project,
    loading,
    error,
  };
}