import {
  BarChart3,
  FileText,
  FolderOpen,
  Waves,
} from "lucide-react";

export default function Sidebar({ currentView, onChangeView }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Waves size={23} />
        </div>

        <div>
          <strong>GeoPermit</strong>
          <span>Data platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${
            currentView === "overview" ? "active" : ""
          }`}
          onClick={() => onChangeView("overview")}
        >
          <BarChart3 size={18} />
          Overview
        </button>

        <button
          className={`nav-item ${
            currentView === "projects" ? "active" : ""
          }`}
          onClick={() => onChangeView("projects")}
        >
          <FolderOpen size={18} />
          Projects
        </button>

        <button
          className={`nav-item ${
            currentView === "documents" ? "active" : ""
          }`}
          onClick={() => onChangeView("documents")}
        >
          <FileText size={18} />
          Documents
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="live-dot" />

          <div>
            <strong>System online</strong>
            <small>API connected</small>
          </div>
        </div>
      </div>
    </aside>
  );
}