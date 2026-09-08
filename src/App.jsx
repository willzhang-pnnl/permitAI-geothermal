import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./components/dashboard/Dashboard";
import ProjectDetail from "./components/project/ProjectDetail";

import { useProjects } from "./hooks/useProjects";
import { useProject } from "./hooks/useProject";
import { uploadProjectFiles } from "./api/geothermalApi";

import "./styles.css";

export default function App() {
  const [currentView, setCurrentView] = useState("overview");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    reload: reloadProjects,
  } = useProjects({
    search,
    state: "",
  });

  const {
    project,
    loading: projectLoading,
    error: projectError,
  } = useProject(selectedProjectId);

  async function handleUpload(files) {
    if (!files.length) return;

    try {
      setUploading(true);
      setUploadMessage("");

      const result = await uploadProjectFiles(files);

      const importedCount = result.imported?.length || 0;
      const failedCount = result.failed?.length || 0;

      setUploadMessage(
        `${importedCount} imported${
          failedCount ? `, ${failedCount} failed` : ""
        }`
      );

      await reloadProjects();
    } catch (error) {
      setUploadMessage(error.message || "Import failed");
    } finally {
      setUploading(false);
    }
  }

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
          onUpload={handleUpload}
          uploading={uploading}
        />

        {uploadMessage && (
          <div className="toast-message">
            {uploadMessage}
          </div>
        )}

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