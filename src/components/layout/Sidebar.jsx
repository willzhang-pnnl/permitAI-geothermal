import {
  BarChart3,
  FileText,
  FolderOpen,
  Images,
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

        <button
          className={`nav-item ${
            currentView === "resources" ? "active" : ""
          }`}
          onClick={() => onChangeView("resources")}
        >
          <Images size={18} />
          Resources
        </button>
      </nav>
    </aside>
  );
}