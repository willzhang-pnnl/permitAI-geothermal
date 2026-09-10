import { useEffect, useState } from "react";
import { fetchProject } from "../api/geothermalApi";

export function useProject(projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let ignore = false;

    async function loadProject() {
      try {
        const data = await fetchProject(projectId);
        if (!ignore) {
          setProject(data);
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Unable to load project");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      ignore = true;
    };
  }, [projectId]);

  return {
    project: projectId ? project : null,
    loading: projectId ? loading : false,
    error: projectId ? error : "",
  };
}
