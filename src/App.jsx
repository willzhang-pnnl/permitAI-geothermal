import { useMemo, useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/dashboard/Dashboard";
import PortfolioOverview from "./components/overview/PortfolioOverview";
import DocumentsView from "./components/documents/DocumentsView";
import ProjectDetail from "./components/project/ProjectDetail";

import { useProjects } from "./hooks/useProjects";
import { useProject } from "./hooks/useProject";
import {
  getUniqueStates,
  getUniqueTechnologies,
} from "./utils/projectUtils";

import "./styles.css";

export default function App() {
  const [currentView, setCurrentView] = useState("overview");
  const [previousView, setPreviousView] = useState("overview");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Filter and sort state for project directory
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [technologyFilter, setTechnologyFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Unfiltered projects query (used for global overview, documents, and filter lists)
  const {
    projects: allProjects,
    loading: allProjectsLoading,
    error: allProjectsError,
  } = useProjects();

  // Filtered projects query for the project directory
  const {
    projects: filteredProjects,
    loading: filteredLoading,
    error: filteredError,
  } = useProjects({
    search,
    state: stateFilter,
    technology: technologyFilter,
    sortBy,
  });

  // Selected project detail
  const {
    project,
    loading: projectLoading,
    error: projectError,
  } = useProject(selectedProjectId);

  // Dynamic filter options derived from dataset
  const availableStates = useMemo(
    () => getUniqueStates(allProjects),
    [allProjects]
  );
  const availableTechnologies = useMemo(
    () => getUniqueTechnologies(allProjects),
    [allProjects]
  );

  function openProject(projectId) {
    setPreviousView(currentView === "project" ? "projects" : currentView);
    setSelectedProjectId(projectId);
    setCurrentView("project");
  }

  function goBackFromProject() {
    setSelectedProjectId(null);
    setCurrentView(previousView || "projects");
  }

  function resetFilters() {
    setSearch("");
    setStateFilter("");
    setTechnologyFilter("");
    setSortBy("name");
  }

  function handleViewChange(view) {
    setCurrentView(view);
    if (view !== "project") {
      setSelectedProjectId(null);
    }
  }

  const isProjectDetail = currentView === "project";

  // Compute dynamic topbar titles
  let topbarTitle = "Portfolio Overview";
  let topbarSubtitle = "GEOTHERMAL INTELLIGENCE PLATFORM";

  if (currentView === "projects") {
    topbarTitle = "Project Directory";
    topbarSubtitle = "ACTIVE DEVELOPMENT ASSETS";
  } else if (currentView === "documents") {
    topbarTitle = "Regulatory Filings";
    topbarSubtitle = "COMPLIANCE & PERMITS";
  } else if (isProjectDetail) {
    topbarTitle = project?.project_name || "Project Details";
    topbarSubtitle = "RESOURCE AREA DOSSIER";
  }

  return (
    <div className="app-shell">
      <Sidebar
        currentView={isProjectDetail ? previousView : currentView}
        onChangeView={handleViewChange}
      />

      <main className="main-content">
        <Topbar title={topbarTitle} subtitle={topbarSubtitle} />

        {currentView === "overview" && (
          <PortfolioOverview
            projects={allProjects}
            onNavigateToProjects={() => handleViewChange("projects")}
            onSelectProject={openProject}
          />
        )}

        {currentView === "projects" && (
          <Dashboard
            projects={filteredProjects}
            loading={filteredLoading || allProjectsLoading}
            error={filteredError || allProjectsError}
            search={search}
            onSearchChange={setSearch}
            stateFilter={stateFilter}
            onStateFilterChange={setStateFilter}
            technologyFilter={technologyFilter}
            onTechnologyFilterChange={setTechnologyFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            states={availableStates}
            technologies={availableTechnologies}
            onResetFilters={resetFilters}
            onSelectProject={openProject}
          />
        )}

        {currentView === "documents" && (
          <DocumentsView
            projects={allProjects}
            onSelectProject={openProject}
          />
        )}

        {isProjectDetail && (
          <ProjectDetail
            project={project}
            loading={projectLoading}
            error={projectError}
            onBack={goBackFromProject}
            backLabel={
              previousView === "documents"
                ? "Back to documents"
                : previousView === "overview"
                ? "Back to overview"
                : "Back to projects"
            }
          />
        )}
      </main>
    </div>
  );
}