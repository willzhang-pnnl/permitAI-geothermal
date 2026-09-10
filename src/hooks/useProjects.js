import { useEffect, useState } from "react";
import { fetchProjects } from "../api/geothermalApi";

export function useProjects({
  search = "",
  state = "",
  technology = "",
  sortBy = "name",
} = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProjects() {
      try {
        const data = await fetchProjects({
          search,
          state,
          technology,
          sortBy,
        });

        if (!ignore) {
          setProjects(data);
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Unable to load projects");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      ignore = true;
    };
  }, [search, state, technology, sortBy]);

  return {
    projects,
    loading,
    error,
  };
}
