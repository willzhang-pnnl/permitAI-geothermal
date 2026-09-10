import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/dashboard/Dashboard";
import ProjectDetail from "./components/project/ProjectDetail";

import { useProjects } from "./hooks/useProjects";
import { useProject } from "./hooks/useProject";

import "./styles.css";

export default function App() {
  const [currentView, setCurrentView] = useState("overview");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState("");

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects({
    search,
    state: "",
  });

  const {
    project,
    loading: projectLoading,
    error: projectError,
  } = useProject(selectedProjectId);

  function openProject(projectId) {
    setSelectedProjectId(projectId);
    setCurrentView("project");
  }

  function goBackToProjects() {
    setSelectedProjectId(null);
    setCurrentView("overview");
  }

  const isProjectDetail = currentView === "project";

  return (
    <div className="app-shell">
      <Sidebar
        currentView={isProjectDetail ? "projects" : currentView}
        onChangeView={(view) => {
          setCurrentView(view);

          if (view !== "project") {
            setSelectedProjectId(null);
          }
        }}
      />

      <main className="main-content">
        <Topbar
          title={
            isProjectDetail
              ? "Project details"
              : "Project overview"
          }
          subtitle="GEOTHERMAL INTELLIGENCE"
        />

        {isProjectDetail ? (
          <ProjectDetail
            project={project}
            loading={projectLoading}
            error={projectError}
            onBack={goBackToProjects}
          />
        ) : (
          <Dashboard
            projects={projects}
            loading={projectsLoading}
            error={projectsError}
            search={search}
            onSearchChange={setSearch}
            onSelectProject={openProject}
          />
        )}
      </main>
    </div>
  );
}