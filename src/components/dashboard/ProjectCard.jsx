import {
  ChevronRight,
  MapPin,
  Waves,
  Zap,
} from "lucide-react";

import {
  getFacilities,
  getProjectProgress,
  getTotalCapacity,
} from "../../utils/projectUtils";

export default function ProjectCard({ project, onClick }) {
  const facilities = getFacilities(project);
  const capacity = getTotalCapacity(project);
  const progress = getProjectProgress(project);

  // Extract distinct technology types
  const techTypes = Array.from(
    new Set(
      facilities
        .map((f) => f.technology_type)
        .filter(Boolean)
    )
  );

  return (
    <button
      type="button"
      className="project-card"
      onClick={onClick}
      aria-label={`View details for ${project.project_name || "project"}`}
    >
      <div className="project-card-top">
        <div className="project-symbol" aria-hidden="true">
          <Waves size={22} />
        </div>

        <div className="project-card-top-right">
          {techTypes.length > 0 && (
            <span className="tech-badge">{techTypes[0]}</span>
          )}
          <ChevronRight size={18} className="card-arrow" aria-hidden="true" />
        </div>
      </div>

      <h3>{project.project_name || "Unnamed Project"}</h3>

      <p className="muted">
        {project.project_description || "No project description available."}
      </p>

      <div className="project-location">
        <MapPin size={15} aria-hidden="true" />
        <span>
          {project.county || "Unknown County"},{" "}
          {project.state || "Unknown State"}
        </span>
      </div>

      <div className="project-card-divider" />

      <div className="card-metrics">
        <div>
          <span>Capacity</span>
          <strong>
            <Zap size={13} className="inline-icon" aria-hidden="true" />
            {capacity} MW
          </strong>
        </div>

        <div>
          <span>Facilities</span>
          <strong>{facilities.length}</strong>
        </div>

        <div>
          <span>Progress</span>
          <strong>{progress}%</strong>
        </div>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Permitting progress"
      >
        <div style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}
