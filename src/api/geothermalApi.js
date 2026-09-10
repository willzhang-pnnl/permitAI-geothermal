const projectFiles = import.meta.glob("../../data/examples/*.json", {
  eager: true,
  import: "default",
});

const projects = Object.values(projectFiles).map((project) => ({
  ...project,
  state: project.location?.state || null,
  county: project.location?.county || null,
}));

export async function fetchProjects({ search = "", state = "" } = {}) {
  const searchValue = search.trim().toLowerCase();
  const stateValue = state.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesSearch = !searchValue || [
      project.project_name,
      project.project_sponsor,
      project.state,
      project.county,
    ].some((value) => String(value || "").toLowerCase().includes(searchValue));

    const matchesState =
      !stateValue || String(project.state || "").toLowerCase() === stateValue;

    return matchesSearch && matchesState;
  });
}

export async function fetchProject(projectId) {
  const project = projects.find((item) => item.project_id === projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}