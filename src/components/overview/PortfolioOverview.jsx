import {
  ArrowRight,
  Building2,
  FileText,
  Globe2,
  Layers,
  Zap,
} from "lucide-react";
import {
  getPortfolioStats,
  getProjectProgress,
  getTotalCapacity,
} from "../../utils/projectUtils";
import UsProjectsMap from "./UsProjectsMap";

export default function PortfolioOverview({
  projects = [],
  onNavigateToProjects,
  onSelectProject,
}) {
  const stats = getPortfolioStats(projects);
  const maxStateMw = Math.max(...stats.stateCapacity.map((s) => s.mw), 1);

  // Top 4 projects by capacity
  const topProjects = [...projects]
    .sort((a, b) => getTotalCapacity(b) - getTotalCapacity(a))
    .slice(0, 4);

  return (
    <div className="portfolio-overview">
      <section className="overview-hero">
        <div className="overview-hero-content">
          <span className="banner-kicker">PORTFOLIO INTELLIGENCE</span>
          <h2>Geothermal Clean Energy Infrastructure</h2>
          <p>
            Holistic view of tracked geothermal exploration, permitting,
            and power generation assets across Western resource basins.
          </p>
        </div>

        <div className="overview-hero-metrics">
          <div className="hero-metric-box">
            <span className="metric-title">PORTFOLIO CAPACITY</span>
            <strong className="metric-val">{stats.totalCapacity.toLocaleString()} MW</strong>
            <span className="metric-sub">{stats.totalFacilities} production units</span>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="overview-kpis">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Zap size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="kpi-label">Tracked Capacity</span>
            <strong className="kpi-value">{stats.totalCapacity.toFixed(0)} MW</strong>
            <span className="kpi-note">Across {stats.statesCount} States</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <Layers size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="kpi-label">Active Projects</span>
            <strong className="kpi-value">{stats.totalProjects}</strong>
            <span className="kpi-note">Resource fields tracked</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <Building2 size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="kpi-label">Production Facilities</span>
            <strong className="kpi-value">{stats.totalFacilities}</strong>
            <span className="kpi-note">{stats.technologies.length} Tech Types</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <FileText size={22} aria-hidden="true" />
          </div>
          <div>
            <span className="kpi-label">Regulatory Filings</span>
            <strong className="kpi-value">{stats.totalDocuments}</strong>
            <span className="kpi-note">EAs, EISs & Permits</span>
          </div>
        </div>
      </div>

      {/* Geographic Map */}
      <section className="panel overview-section map-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">GEOGRAPHIC SPREAD</p>
            <h2>Project Locations & Capacity</h2>
          </div>
          <Globe2 size={20} className="heading-icon" aria-hidden="true" />
        </div>
        <UsProjectsMap projects={projects} onSelectProject={onSelectProject} />
      </section>

      {/* Two Column Section: State Distribution & Technology Breakdown */}
      <div className="two-column overview-section">
        {/* State Distribution */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">GEOGRAPHIC SPREAD</p>
              <h2>Capacity by State</h2>
            </div>
            <Globe2 size={20} className="heading-icon" aria-hidden="true" />
          </div>

          <div className="state-capacity-list">
            {stats.stateCapacity.map(({ state, mw }) => {
              const percentage = Math.round((mw / maxStateMw) * 100);
              return (
                <div className="state-bar-row" key={state}>
                  <div className="state-bar-header">
                    <strong>{state}</strong>
                    <span>{mw} MW</span>
                  </div>
                  <div className="state-bar-track">
                    <div
                      className="state-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Technology Breakdown */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ASSET DIVERSITY</p>
              <h2>Generation Technologies</h2>
            </div>
            <Layers size={20} className="heading-icon" aria-hidden="true" />
          </div>

          <div className="tech-distribution-grid">
            {stats.technologies.map(({ technology, count, mw }) => (
              <div className="tech-distribution-card" key={technology}>
                <div className="tech-header">
                  <strong>{technology}</strong>
                  <span className="tech-mw">{mw} MW</span>
                </div>
                <span className="tech-sub">{count} unit{count === 1 ? "" : "s"} installed</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Leading Projects Highlight */}
      <section className="panel leading-projects-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">KEY ASSETS</p>
            <h2>Largest Capacity Projects</h2>
          </div>
          <button
            type="button"
            className="view-all-projects-btn"
            onClick={onNavigateToProjects}
          >
            <span>View all {projects.length} projects</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="top-projects-grid">
          {topProjects.map((project) => {
            const capacity = getTotalCapacity(project);
            const progress = getProjectProgress(project);
            return (
              <div
                className="top-project-item"
                key={project.project_id}
                onClick={() => onSelectProject(project.project_id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProject(project.project_id);
                  }
                }}
              >
                <div className="top-project-header">
                  <strong>{project.project_name}</strong>
                  <span className="top-project-capacity">{capacity} MW</span>
                </div>
                <p className="top-project-loc">
                  {project.county}, {project.state}
                </p>
                <div className="top-project-progress">
                  <span>Permit Progress: {progress}%</span>
                  <div className="progress-bar">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

