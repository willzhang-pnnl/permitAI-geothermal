import {
  Building2,
  ChevronRight,
  MapPin,
  Waves,
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

  return (
    <button className="project-card" onClick={onClick}>
      <div className="project-card-top">
        <div className="project-symbol">
          <Waves size={22} />
        </div>

        <ChevronRight size={18} className="card-arrow" />
      </div>

      <h3>{project.project_name || "Unnamed Project"}</h3>

      <p className="muted">
        {project.project_description ||
          "No project description available."}
      </p>

      <div className="project-location">
        <MapPin size={15} />
        <span>
          {project.county || "Unknown County"},{" "}
          {project.state || "Unknown State"}
        </span>
      </div>

      <div className="project-card-divider" />

      <div className="card-metrics">
        <div>
          <span>Capacity</span>
          <strong>{capacity} MW</strong>
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

      <div className="progress-bar">
        <div style={{ width: `${progress}%` }} />
      </div>
    </button>
  );
}