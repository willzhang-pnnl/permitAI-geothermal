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
  stateFilter,
  onStateFilterChange,
  technologyFilter,
  onTechnologyFilterChange,
  sortBy,
  onSortByChange,
  states = [],
  technologies = [],
  onResetFilters,
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
          <span className="banner-kicker">PROJECT DIRECTORY</span>
          <h2>Geothermal Asset Portfolio</h2>

          <p>
            Explore permitting phases, generation assets, and project
            metadata across active geothermal developments.
          </p>
        </div>

        <div className="banner-number">
          <strong>{totalCapacity.toFixed(0)}</strong>
          <span>MW in view</span>
        </div>
      </section>

      <div className="summary-strip">
        <div>
          <FolderOpen size={18} aria-hidden="true" />
          <span>{projects.length} matching projects</span>
        </div>

        <div>
          <Zap size={18} aria-hidden="true" />
          <span>{totalCapacity.toFixed(0)} MW total capacity</span>
        </div>

        <div>
          <Activity size={18} aria-hidden="true" />
          <span>Verified Registry Data</span>
        </div>
      </div>

      <SearchToolbar
        search={search}
        onSearchChange={onSearchChange}
        stateFilter={stateFilter}
        onStateFilterChange={onStateFilterChange}
        technologyFilter={technologyFilter}
        onTechnologyFilterChange={onTechnologyFilterChange}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        states={states}
        technologies={technologies}
        projectCount={projects.length}
        onResetFilters={onResetFilters}
      />

      {projects.length === 0 ? (
        <div className="empty-state-container">
          <EmptyState
            title="No projects match your criteria"
            description="Try loosening your search terms or clearing active filters."
          />
          {(search || stateFilter || technologyFilter || sortBy !== "name") && (
            <button
              type="button"
              className="clear-filters-action-btn"
              onClick={onResetFilters}
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <section className="project-grid" aria-label="Geothermal projects list">
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
