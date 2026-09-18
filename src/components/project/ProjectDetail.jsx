import {
  ArrowLeft,
  Globe2,
} from "lucide-react";

import ProjectStats from "./ProjectStats";
import LifecyclePanel from "./LifecyclePanel";
import FacilitiesPanel from "./FacilitiesPanel";
import DocumentsPanel from "./DocumentsPanel";
import MetadataPanel from "./MetadataPanel";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import { normalizeProject } from "../../utils/projectUtils";

export default function ProjectDetail({
  project,
  loading,
  error,
  onBack,
  backLabel = "Back to projects",
}) {
  if (loading) {
    return <LoadingState message="Loading project details..." />;
  }

  if (error) {
    return (
      <>
        <button type="button" className="back-button" onClick={onBack}>
          <ArrowLeft size={17} aria-hidden="true" />
          {backLabel}
        </button>

        <EmptyState
          title="Unable to load project"
          description={error}
        />
      </>
    );
  }

  if (!project) {
    return null;
  }

  const normalizedProject = normalizeProject(project);
  const location = normalizedProject.location || {};

  return (
    <>
      <button type="button" className="back-button" onClick={onBack}>
        <ArrowLeft size={17} aria-hidden="true" />
        {backLabel}
      </button>

      <div className="detail-hero">
        <div>
          <div className="hero-label">
            <span className="live-dot" />
            GEOTHERMAL PROJECT
          </div>

          <h1>
            {normalizedProject.project_name || "Unnamed Project"}
          </h1>

          <p>
            {normalizedProject.project_description ||
              "No project description has been provided."}
          </p>
        </div>

        <div className="hero-location">
          <Globe2 size={18} />

          <span>
            {location.state || "State unavailable"}
            <small>
              {location.county || "County unavailable"}
            </small>
          </span>
        </div>
      </div>

      <ProjectStats project={normalizedProject} />

      <div className="two-column">
        <MetadataPanel project={normalizedProject} />
        <FacilitiesPanel project={normalizedProject} />
      </div>

      <LifecyclePanel project={normalizedProject} />

      <DocumentsPanel project={normalizedProject} />
    </>
  );
}