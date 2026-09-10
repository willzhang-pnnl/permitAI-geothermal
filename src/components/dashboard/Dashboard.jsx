import {
  Activity,
  FolderOpen,
  Zap,
} from "lucide-react";

import ProjectCard from "./ProjectCard";
import SearchToolbar from "./SearchToolbar";
import EmptyState from "../common/EmptyState";
import LoadingState from "../common/LoadingState";
import { getTotalCapacity } from "../../utils/projectUtils";

export default function Dashboard({
  projects,
  loading,
  error,
  search,
  onSearchChange,
  onSelectProject,
}) {
  const totalCapacity = projects.reduce(
    (total, project) => total + getTotalCapacity(project),
    0
  );

  if (loading) {
    return <LoadingState message="Loading geothermal projects..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load projects"
        description={error}
      />
    );
  }

  return (
    <>
      <section className="overview-banner">
        <div>
          <span className="banner-kicker">DATA OVERVIEW</span>
          <h2>Geothermal development intelligence</h2>

          <p>
            Explore permitting progress, generation assets, and project
            metadata across your geothermal portfolio.
          </p>
        </div>

        <div className="banner-number">
          <strong>{totalCapacity.toFixed(0)}</strong>
          <span>MW tracked</span>
        </div>
      </section>

      <div className="summary-strip">
        <div>
          <FolderOpen size={18} />
          <span>{projects.length} projects</span>
        </div>

        <div>
          <Zap size={18} />
          <span>{totalCapacity.toFixed(0)} MW total capacity</span>
        </div>

        <div>
          <Activity size={18} />
          <span>Bundled JSON data</span>
        </div>
      </div>

      <SearchToolbar
        search={search}
        onSearchChange={onSearchChange}
        projectCount={projects.length}
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects match your search"
          description="Try changing the search text or import additional JSON files."
        />
      ) : (
        <section className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.project_id}
              project={project}
              onClick={() => onSelectProject(project.project_id)}
            />
          ))}
        </section>
      )}
    </>
  );
}