import {
  getAllDocuments,
  getPortfolioStats,
  getProjectProgress,
  getTotalCapacity,
  normalizeProject,
} from "../utils/projectUtils";

const projectFiles = import.meta.glob("../../data/examples/*.json", {
  eager: true,
  import: "default",
});

const rawProjects = Object.values(projectFiles).map((project) =>
  normalizeProject(project)
);

export async function fetchProjects({
  search = "",
  state = "",
  technology = "",
  sortBy = "name",
} = {}) {
  const searchValue = search.trim().toLowerCase();
  const stateValue = state.trim().toLowerCase();
  const techValue = technology.trim().toLowerCase();

  const filtered = rawProjects.filter((project) => {
    const matchesSearch =
      !searchValue ||
      [
        project.project_name,
        project.project_sponsor,
        project.state,
        project.county,
        project.kgra_name,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchValue)
      );

    const matchesState =
      !stateValue || String(project.state || "").toLowerCase() === stateValue;

    const matchesTech =
      !techValue ||
      (project.facilities || []).some((facility) =>
        String(facility.technology_type || "")
          .toLowerCase()
          .includes(techValue)
      );

    return matchesSearch && matchesState && matchesTech;
  });

  return filtered.sort((a, b) => {
    if (sortBy === "capacity-desc") {
      return getTotalCapacity(b) - getTotalCapacity(a);
    }
    if (sortBy === "capacity-asc") {
      return getTotalCapacity(a) - getTotalCapacity(b);
    }
    if (sortBy === "progress-desc") {
      return getProjectProgress(b) - getProjectProgress(a);
    }
    if (sortBy === "progress-asc") {
      return getProjectProgress(a) - getProjectProgress(b);
    }
    // Default: alphabetical by name
    return (a.project_name || "").localeCompare(b.project_name || "");
  });
}

export async function fetchProject(projectId) {
  const project = rawProjects.find((item) => item.project_id === projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function fetchPortfolioSummary() {
  return getPortfolioStats(rawProjects);
}

export async function fetchAllDocuments() {
  return getAllDocuments(rawProjects);
}
